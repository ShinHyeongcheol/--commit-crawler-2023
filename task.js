const { getLastSavedCommitTime, saveCommit } = require('./api/db');
const { getUnsavedCommit } = require('./api/slack');
const { member_list_github } = require('./config/config');

switch (process.argv[2]) {
  case 'save':
    (async () => {
      const lastTime = await getLastSavedCommitTime().then((res) => res);
      let unSavedCommit = await getUnsavedCommit(lastTime);
	  // console.log(unSavedCommit);
      unSavedCommit = unSavedCommit.reverse();
      unSavedCommit.map(async (e) => {
        if (!member_list_github.includes(e['author_name'])) {
          return;
        }
        await saveCommit({
          username: e['author_name'],
          commitLink: e['commit_link'],
          timestamp: e['timestamp'],
        });
      });
      // console.log(new Date());
    })();
}
