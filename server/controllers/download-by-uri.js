'use strict';

const path = require('path');
const {PassThrough} = require('stream');
const url = require('url');

const {default: log} = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');
const mime = require('mime-types');
const moment = require('moment');

const MessageQueueEvent = require('../../queue/message-queue-event');
const publish = require('../../queue/publish');

const RE_ATTACHMENT = /^attachment;\s+filename=.*$/i;
const RE_SLASH = /\//g;

// WORD DOC => https://local.ft.com:5050/syndication/download?uri=https%3A%2F%2Fft-rss.herokuapp.com%2Fcontent%2Fb59dff10-3f7e-11e7-9d56-25f963e998b2%3Fformat%3Ddocx%26download%3Dtrue
// VIDEO    => https://local.ft.com:5050/syndication/download?uri=https%3A%2F%2Fnext-media-api.ft.com%2Frenditions%2F14955580012610%2F1920x1080.mp4

module.exports = (req, res, next) => {
    const URI = decodeURIComponent(req.query.uri);

    const stream = new PassThrough();

    fetch(URI, {method: 'HEAD'}).then((uriRes) => {
        const HEADERS = uriRes.headers.raw();

        Object.keys(HEADERS).forEach(name => res.set(name, HEADERS[name][0]));

        if (!uriRes.ok) {
            res.status(uriRes.status).end();

            return next();
        }

        const LENGTH = parseInt(uriRes.headers.get('content-length'), 10);

        let contentDisposition = uriRes.headers.get('content-disposition');

        if (!RE_ATTACHMENT.test(contentDisposition)) {
            let filename = url.parse(URI).pathname.substring(1).replace(RE_SLASH, '_');

            if (!path.extname(filename)) {
                filename += `.${mime.extension(uriRes.headers.get('content-type'))}`;
            }

            contentDisposition = `attachment; filename=${filename}`;
        }

        let [, filename] = contentDisposition.split(';');
        [, filename] = filename.split('=');

        let eventStart = new MessageQueueEvent({
            event: {
                content_id: url.parse(URI).pathname.split('/').pop(),   // todo: should we resovle this form the URI or send it through in the QS?
                content_uri: URI,
                download_format: path.extname(filename).substring(1),
                licence_id: null,                                       // todo: we need this
                state: 'start',
                time: moment().toDate(),
                user_id: null                                           // todo: and we also need this
            }
        });

        log.info('DOWNLOAD START', eventStart.toJSON());
        (async () => await publish(eventStart))();

        res.set('Content-Disposition', contentDisposition);

        let cancelDownload = () => req.__download_cancelled__ = true;
        req.on('abort', cancelDownload);
        req.connection.on('close', cancelDownload);

        let length = 0;
        let uriStream;
        let onend = () => {
            // We're cloning `eventStart` as it will have the `_id` property assigned.
            // We want both events to have the same `_id` so we can match them.
            // We use `state` to determine uniqueness
            let eventEnd = eventStart.clone();
            eventEnd.time = moment().toJSON();

            if (length < LENGTH) {
                eventEnd.state = 'interrupted';

                log.info('DOWNLOAD INTERRUPTED', eventEnd.toJSON());

                res.status(400);
            }
            else {
                eventEnd.state = 'complete';

                log.info('DOWNLOAD COMPLETE', eventEnd.toJSON());

                res.status(200);
            }

            (async () => await publish(eventEnd))();

            res.end();

            next();
        };

        stream.on('close', onend);
        stream.on('end', onend);

        stream.on('data', (chunk) => {
            if (req.__download_cancelled__ === true) {
                uriStream.end();

                return;
            }

            res.write(chunk);

            length += chunk.length;
        });

        let headers = Object.assign({}, req.headers);

        ['accept', 'host'].forEach(name => delete headers[name]);

        Object.keys(headers).forEach(name => headers[name] !== '-' || delete headers[name]);

        fetch(URI, {headers: headers}).then((uriRes) => {
            uriRes.body.pipe(stream);

            uriStream = uriRes.body;
        });
    });
};
