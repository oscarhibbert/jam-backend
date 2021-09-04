/**
 * @desc                                        Checks whether input string is an ISO formatted string in Zulu time
 * @param   {string}       isoDateString        ISO date as a string
 * @return                                      Boolean true or false
*/
const checkIsoDate = (isoDateString) => {
    // See here: https://stackoverflow.com/questions/52869695/check-if-a-date-string-is-in-iso-and-utc-format
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(isoDateString)) return false;
                var d = new Date(isoDateString);
                return d.toISOString() === isoDateString;
};

module.exports = checkIsoDate;