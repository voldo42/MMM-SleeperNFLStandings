Module.register("MMM-SleeperNFLStandings", {
  defaults: {
    reloadInterval: 1000 * 60 * 10
  },

  getStyles() {
    return ["font-awesome.css", `${this.name}.css`];
  },

  getTemplate() {
    return `${this.name}.njk`;
  },

  getTemplateData() {
    return {
      config: this.config,
      week: this.week,
      season: this.season,
      league: this.league,
      standings: this.standings
    };
  },

  start() {
    Log.info(`Starting module: ${this.name}`);
    this.sendSocketNotification("STANDINGS_REQUEST", {
      reloadInterval: this.config.reloadInterval,
      leagueId: this.config.leagueId
    });
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "STANDINGS_RESPONSE") {
      this.week = payload.week;
      this.season = payload.season;
      this.league = payload.league;
      this.standings = payload.standings;

      this.updateDom(300);
    }
  }
});
