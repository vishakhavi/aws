const AWS = require('aws-sdk');
const loggerService = require("../services/logger.service");

AWS.config.update({region: process.env.REGION});
const getSNSParam = (message) => {
    return {
        Message: message,
        TopicArn: process.env.SNS_ARN
    }
}
const sendToSNS = (message) => {
    loggerService.info(message);
    const params = getSNSParam(message);
    // Create promise and SNS service object
    var publishTextPromise = new AWS.SNS({
        apiVersion: '2010-03-31'
    }).publish(params).promise();

    // Handle promise's fulfilled/rejected states
    publishTextPromise.then(
        function (data) {
            loggerService.info(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
            loggerService.info("MessageID is " + data.MessageId);
        }).catch(
        function (err) {
            loggerService.error("Exception at aws sns publish message service", err);
        });
}

module.exports = {
    sendMessage : sendToSNS
}
