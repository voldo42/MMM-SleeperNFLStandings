const NodeHelper = require("node_helper");
const Log = require("logger");

const Sleeper = require("./Sleeper");

module.exports = NodeHelper.create({
  requiresVersion: "2.15.0",
  reloadInterval: null,

  async socketNotificationReceived(notification, payload) {

    if (notification === "STANDINGS_REQUEST") {
      this.reloadInterval = setInterval(() => {
        this.getData(payload.leagueId);
      }, payload.reloadInterval);
      await this.getData(payload.leagueId);
    }
  },

  async getData(leagueId) {
    Log.info(`Getting sleeper data`);

    try {
      const state = await Sleeper.getNFLState();
      const league = await Sleeper.getLeague(leagueId);
      const rosters = await Sleeper.getRosters(leagueId);

      var orderedTeams = rosters.sort((a, b) => {
        if (a.wins === b.wins) {
          // Points is only important when wins are the same
          return b.ptsFor - a.ptsFor;
        }
        return b.wins - a.wins;
      });

      // Assign rank and team name
      for (let i = 0; i < orderedTeams.length; i++) {
        orderedTeams[i].rank = i + 1;

        let user = await Sleeper.getLeagueUser(leagueId, orderedTeams[i].userId);
        orderedTeams[i].teamName = user.teamName;
        orderedTeams[i].avatar = user.avatar;
      }

      response = {
        week: state.week,
        season: state.season,
        league: league,
        standings: orderedTeams        
      };

      this.sendSocketNotification("STANDINGS_RESPONSE", response);
    } catch (error) {
      Log.error(`Error getting Sleeper data ${error}`);
    }
  },

  stop() {
    clearInterval(this.reloadInterval);
  }
});
