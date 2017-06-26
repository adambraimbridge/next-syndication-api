const downloadableFormats = [
    'docx',
    'html',
    'plain'
];

const populateDownloadLinks = content => {
    return {
        uuid: content.uuid,
        links: downloadableFormats.map(format => {
            return {
                format,
                url: `https://ft-rss.herokuapp.com/content/${content.uuid}?format=${format}&download=true`
            };
        })
    };
};

module.exports = populateDownloadLinks;
