const summaryHistoryController = {
    getSummaryHistory: function (req, res) {
        summaryHistoryModel.getSummaryHistory(req, res);
    }
}

module.exports = summaryHistoryController;