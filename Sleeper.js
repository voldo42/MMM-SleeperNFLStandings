const fetch = require("node-fetch");

const BaseUri = "https://api.sleeper.app/v1/";
const AvatarThumbUri = "https://sleepercdn.com/avatars/thumbs/";

async function getNFLState() {
    const response = await fetch(BaseUri + "state/nfl");

    if (!response.ok) {
        throw new Error("Failed to fetch NFL state");
    }

    const parsedResponse = await response.json();

    const state = {
        week: parsedResponse?.week,
        season: parsedResponse?.season
    };

    return state;
}

async function getUserIdByUsername(username) {
    const response = await fetch(BaseUri + `user/${username}`);

    if (!response.ok) {
        throw new Error("Failed to fetch user");
    }

    const parsedResponse = await response.json();

    return parsedResponse?.user_id;
}

async function getUser(userId) {
    const response = await fetch(BaseUri + `user/${userId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch user");
    }

    const parsedResponse = await response.json();

    const user = {
        userId: parsedResponse?.user_id,
        username: parsedResponse?.username,
        avatar: parsedResponse?.avatar,
    };

    return user;
}

async function getLeagueUser(leagueId, userId) {
    const response = await fetch(BaseUri + `league/${leagueId}/users`);

    if (!response.ok) {
        throw new Error("Failed to fetch league users");
    }

    const parsedResponse = await response.json();
    const team = parsedResponse.find((x) => x.user_id == userId);
    const user = {
      teamName: team?.metadata.team_name ?? "Team " + team?.display_name,
      avatar: team?.metadata.avatar ?? AvatarThumbUri + team?.avatar
    };

    return user;
}

async function getLeague(leagueId) {
    const response = await fetch(BaseUri + `league/${leagueId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch league");
    }

    const parsedResponse = await response.json();

    const league = {
      name: parsedResponse?.name,
      avatar: AvatarThumbUri + parsedResponse?.avatar
    };

    return league;
}

async function getRosters(leagueId) {
    const response = await fetch(BaseUri + `league/${leagueId}/rosters`);

    if (!response.ok) {
        throw new Error("Failed to fetch rosters");
    }

    const parsedResponse = await response.json();

    const rosters = parsedResponse.map((team) => {

        let ptsFor = `${team?.settings.fpts}.${team?.settings.fpts_decimal}`;
        let ptsAgainst = `${team?.settings.fpts_against}.${team?.settings.fpts_against_decimal}`;

        return {
          rosterId: team?.roster_id,
          userId: team?.owner_id,
          wins: team?.settings.wins,
          losses: team?.settings.losses,
          ties: team?.settings.ties,
          ptsFor: parseFloat(ptsFor).toFixed(2),
          ptsAgainst: parseFloat(ptsFor).toFixed(2),
          waiverPosition: team?.settings.waiver_position
        };
    });

    return rosters;
}

module.exports = {
    getNFLState,
    getUserIdByUsername,
    getUser,
    getLeagueUser,
    getLeague,
    getRosters
};
