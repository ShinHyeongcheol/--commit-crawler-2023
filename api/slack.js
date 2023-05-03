const { WebClient } = require('@slack/web-api');
const CONFIG = require('../config/config');

const web = new WebClient(CONFIG.slack_api_token);

const readCommitHistory = async () => {
  const res = web.conversations.history({ channel: CONFIG.slack_channel_id });
  const history = await res.then((res) => {
	//console.log(res);
    let messages = res.messages
      .map((e) => {
        if (e['attachments'] === undefined) return null;
        return {
          ts: e['ts'],
          detail: e['attachments'][0],
		  text: e['text'],
        };
      })
      // Exclude simple messages (ex. someone joined)
      .filter((e) => e !== null)
      // Exclude pr, creating repo
	  .filter(
        (e) =>
          e['detail']['fallback'] !== undefined &&
          e['detail']['text'] !== undefined
      )
      .map((e) => {
        const commit_text = e['detail']['text'];
        let commitLink = commit_text.substring(
          commit_text.indexOf('<') + 1,
          commit_text.indexOf('|')
        );
		const fallback_name = e['detail']['fallback'];
		const commit_in_fallbak = fallback_name.substring(
			fallback_name.indexOf('commit')
		);
		let name_in_fallback = commit_in_fallbak.substring(
			commit_in_fallbak.indexOf('by') + 3
		);
		//console.log(commit_in_fallbak);
		console.log(name_in_fallback);
		//console.log(commit_text, fallback_name);
        // const offset = new Date().getTimezoneOffset();
        // const ts = new Date(e['ts'] * 1000 - offset * 60 * 1000);
        const ts = new Date(e['ts'] * 1000);
        return {
          // author_name: e['detail']['author_name'],
		  author_name: name_in_fallback,
          commit_link: commitLink,
          timestamp: ts
        };
      });
	  //console.log(messages);
    return messages;
  });
  return history;
};

const getUnsavedCommit = async (lastSavedCommitTime) => {
  const history = await readCommitHistory();
  // console.log("slack-Unsaved-commit");
  // console.log(history);
  return history.filter(
    (e) => new Date(e['timestamp']) > new Date(lastSavedCommitTime)
  );
};

module.exports = {
  readCommitHistory,
  getUnsavedCommit,
};
