const fs = require('fs');
const asyncFs = require('fs/promises');

function loadData(path) {
  const data = fs.readFileSync(path);
  return JSON.parse(data);
}

function loadUsersData() {
  return loadData('./jsons/users.json');
}

function loadDiscussionsData() {
  return loadData('./jsons/discussions.json');
}

async function saveData(path, data, cb) {
  await asyncFs.writeFile(path, data);
  cb();
}

async function saveUsersData(data, cb) {
  return await saveData('./jsons/users.json', JSON.stringify(data), cb);
}

async function saveDiscussionsData(data, cb) {
  return await saveData('./jsons/discussions.json', JSON.stringify(data), cb);
}

module.exports = {
  loadUsersData,
  loadDiscussionsData,
  saveUsersData,
  saveDiscussionsData,
};
