import nodeCron from 'node-cron';
import Account from '../db/models/Account';

nodeCron.schedule('*/5 * * * * *', async () => {
  // console.log('running a task every 5 seconds');
  // const tmp = await Account.findAll();
  // tmp.forEach((account) => console.log(account.uuid));
});

export default nodeCron;
