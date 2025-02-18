let discussions = null;
const email = document.cookie.split(' ')[1].split('=')[1].replace('%40', '@');

function createDiscussion(subject, question, cb) {
  let id = Date.now();
  const discussion = {
    email: email,
    subject: subject,
    question: question,
    responses: null,
    starred: false,
    timestamp: Date.now(),
  };
  if (discussions != null && Object.keys(discussions).length > 0) {
    // id = Number(Object.keys(discussions)[Object.keys(discussions).length - 1]);
    // discussions[++id] = discussion;
    discussions[id] = discussion;
  } else {
    discussions = { [id]: discussion };
  }
  saveDiscussion('create', id, () => cb(id, subject, question));
}

function deleteDiscussion(dis_id) {
  if (discussions != null) {
    delete discussions[dis_id];
    saveDiscussion('delete', dis_id, () => {
      const question_element = document.getElementById(dis_id);
      question_element.remove();
    });
  }
}

function makeDiscussion(
  id,
  subject,
  question,
  isStar = true,
  isUnstar = false
) {
  const question_pane = document.querySelector('.question-pane .all-questions');
  const question_element = document.createElement('div');
  question_element.className = 'question';
  question_element.id = id;
  question_element.title = discussions[id].email;

  // Content
  const content = document.createElement('div');
  content.className = 'content';
  const title = document.createElement('div');
  title.className = 'title';
  title.innerHTML = subject;
  const desc = document.createElement('div');
  desc.className = 'desc';
  desc.innerHTML = question;
  content.appendChild(title);
  content.appendChild(desc);

  // Star
  const starred = document.createElement('div');
  starred.className = 'starred';
  const starIcon1 = document.createElement('i');
  starIcon1.classList.add('fa');
  starIcon1.classList.add('fa-star-o');
  if (isStar) {
    starred.setAttribute('name', 'starred');
    starIcon1.classList.add('hide');
  }
  starIcon1.ariaHidden = 'true';
  starIcon1.title = 'starred';
  const starIcon2 = document.createElement('i');
  starIcon2.classList.add('fa');
  starIcon2.classList.add('fa-star');
  if (isUnstar) {
    starred.setAttribute('name', 'unstarred');
    starIcon2.classList.add('hide');
  }
  starIcon2.ariaHidden = 'true';
  starIcon2.title = 'unstarred';
  starred.appendChild(starIcon1);
  starred.appendChild(starIcon2);

  // const title_timer = document.createElement('div');
  // title_timer.className = 'title-timer';

  // const userTitle = document.createElement('div');
  // userTitle.innerText = `<${discussions[id].email}>`;
  // question_element.appendChild(userTitle);

  // Timer
  const timer = document.createElement('div');
  timer.className = 'timer';
  timer.innerText = 'Added few seconds ago.';
  timer.setAttribute('timestamp', discussions[id].timestamp);
  // title_timer.appendChild(timer);

  const empty_div = document.createElement('div');
  empty_div.appendChild(content);
  empty_div.appendChild(starred);
  question_element.appendChild(empty_div);
  question_element.appendChild(timer);
  question_pane.appendChild(question_element);
}

function saveDiscussion(query, dis_id, cb) {
  // localStorage.setItem('discussions', JSON.stringify(discussions));
  console.log(query);
  if (query == 'delete') {
    fetch(location.origin + '/discussion', {
      method: 'DELETE',
      body: JSON.stringify({
        id: dis_id,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((rsp) => {
      if (cb != undefined && rsp.status == 204) {
        cb();
      }
    });
  } else {
    fetch(location.origin + '/discussion', {
      method: 'POST',
      body: JSON.stringify({
        id: dis_id,
        data: discussions[dis_id],
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((rsp) => {
      if (cb != undefined && rsp.status == 200) {
        cb();
      }
    });
  }
}

function loadDiscussion() {
  fetch(location.origin + '/discussions')
    .then((response) => response.json())
    .then((data) => {
      discussions = data.discussions;
      const stars = data.stars.split(';');
      if (discussions != null && discussions != undefined) {
        for (let dis_id in discussions) {
          let discussion = discussions[dis_id];
          if (discussion.starred || stars.includes(dis_id)) {
            makeDiscussion(
              dis_id,
              discussion.subject,
              discussion.question,
              true,
              false
            );
          } else {
            makeDiscussion(
              dis_id,
              discussion.subject,
              discussion.question,
              false,
              true
            );
          }
        }
      }
    });
  // discussions = JSON.parse(localStorage.getItem('discussions'));
}
loadDiscussion();

function addDiscussionHandler() {
  const title = document.querySelector('.question-form form input');
  const desc = document.querySelector('.question-form form textarea');
  const subject = title.value;
  const question = desc.value;
  if (subject === '' || subject === ' ' || subject === null) {
    return;
  }
  if (question === '' || question === ' ' || question === null) {
    return;
  }
  createDiscussion(subject, question, (dis_id, subject, question) => {
    makeDiscussion(dis_id, subject, question, false, true);
  });
  title.value = null;
  desc.value = null;
}
const discussion_submit_btn = document.querySelector(
  '.question-form .btn button'
);
discussion_submit_btn.addEventListener('click', addDiscussionHandler);

function toggleForm(opr) {
  const question_form_pane = document.querySelector(
    '.form-field .question-form'
  );
  const response_form_pane = document.querySelector(
    '.form-field .response-form'
  );
  if (opr == 0 && question_form_pane.classList.contains('hide')) {
    question_form_pane.classList.remove('hide');
    response_form_pane.classList.add('hide');
  } else if (opr == 1 && response_form_pane.classList.contains('hide')) {
    question_form_pane.classList.add('hide');
    response_form_pane.classList.remove('hide');
  }
}

function discussionClickHandler(e) {
  if (e.target.tagName === 'BUTTON') {
    toggleForm(0);
  }
  if (
    e.target.className === 'question' ||
    e.target.parentNode.className === 'question' ||
    e.target.className === 'title' ||
    e.target.className === 'desc' ||
    e.target.className === 'content' ||
    e.target.className === 'timer'
  ) {
    let id = 1;
    if (e.target.className == 'title' || e.target.className == 'desc') {
      id = e.target.parentNode.parentNode.parentNode.id;
    } else if (e.target.className == 'content') {
      id = e.target.parentNode.parentNode.id;
    } else if (e.target.className == 'timer') {
      id = e.target.parentNode.id;
    } else {
      id = e.target.id;
    }
    toggleForm(1);
    const question_tab = document.querySelector('.response-form .question-tab');
    const h3 = document.querySelector('.response-form .question-tab h3');
    const main_question = document.querySelector('.response-form .question');
    main_question.title = discussions[id].email;
    const question_title = document.querySelector(
      '.response-form .question .title'
    );
    const question_desc = document.querySelector(
      '.response-form .question .desc'
    );
    const question_timer = document.querySelector(
      '.response-form .question .timer'
    );

    const now_mail = discussions[id].email;
    if (now_mail == email) {
      h3.innerText = `Question by <YOU>`;
    } else {
      h3.innerText = `Question by <${now_mail}>`;
    }
    question_tab.id = `q${id}`;
    question_title.innerHTML = discussions[id].subject;
    question_desc.innerHTML = discussions[id].question;
    question_timer.setAttribute('timestamp', discussions[id].timestamp);
    const timestamp = Date.now() - discussions[id].timestamp;
    const seconds_gone = Math.floor(timestamp / 1000);
    if (seconds_gone < 60) {
      question_timer.innerText = 'Added few seconds ago.';
    } else if (seconds_gone > 60 && seconds_gone < 3600) {
      question_timer.innerText = `Added ${Math.floor(
        seconds_gone / 60
      )} minute ago.`;
    } else {
      question_timer.innerText = `Added ${Math.floor(
        seconds_gone / 60 / 60
      )} hour ago.`;
    }
    clearResponses();
    loadResponses(id);
  }
  if (e.target.title === 'starred') {
    if (e.target.parentNode.parentNode.className == 'search-box btn') {
      e.target.classList.add('hide');
      // console.log(e.target.parentNode.childNodes);
      e.target.parentNode.childNodes[3].classList.remove('hide');
      e.target.parentNode.setAttribute('name', 'starred');

      // Get all questions
      const all_questions = document.querySelector(
        '.question-pane .all-questions'
      );

      // Hide all unstarred questions
      const questions = all_questions.childNodes;
      questions.forEach((question) => {
        if (question.firstChild.lastChild.getAttribute('name') == 'unstarred') {
          question.classList.add('hide');
        }
      });
    } else {
      const dis_id = Number(e.target.parentNode.parentNode.parentNode.id);
      discussions[dis_id].starred = true;
      // Saving the data here...
      fetch(location.origin + '/starred', {
        method: 'POST',
        body: JSON.stringify({
          query: 'add',
          id: dis_id,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      }).then((rsp) => {
        if (rsp.status == 200) {
          e.target.classList.add('hide');
          e.target.parentNode.lastChild.classList.remove('hide');
          e.target.parentNode.setAttribute('name', 'starred');
        }
      });
      // saveDiscussion('update', dis_id, () => {
      //   e.target.classList.add('hide');
      //   e.target.parentNode.lastChild.classList.remove('hide');
      //   e.target.parentNode.setAttribute('name', 'starred');
      // });
    }
  } else if (e.target.title === 'unstarred') {
    if (e.target.parentNode.parentNode.className == 'search-box btn') {
      e.target.classList.add('hide');
      // console.log(e.target.parentNode.childNodes);
      e.target.parentNode.childNodes[1].classList.remove('hide');
      e.target.parentNode.setAttribute('name', 'unstarred');
      const all_questions = document.querySelector(
        '.question-pane .all-questions'
      );
      const questions = all_questions.childNodes;
      questions.forEach((question) => {
        if (question.firstChild.lastChild.getAttribute('name') == 'unstarred') {
          question.classList.remove('hide');
        }
      });
    } else {
      const dis_id = Number(e.target.parentNode.parentNode.parentNode.id);
      discussions[dis_id].starred = false;
      // Saving the data here...
      fetch(location.origin + '/starred', {
        method: 'POST',
        body: JSON.stringify({
          query: 'remove',
          id: dis_id,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      }).then((rsp) => {
        if (rsp.status == 200) {
          e.target.classList.add('hide');
          e.target.parentNode.firstChild.classList.remove('hide');
          e.target.parentNode.setAttribute('name', 'unstarred');
        }
      });
      // saveDiscussion('update', dis_id, () => {
      //   e.target.classList.add('hide');
      //   e.target.parentNode.firstChild.classList.remove('hide');
      //   e.target.parentNode.setAttribute('name', 'unstarred');
      // });
    }
  }
}
const discussion_panel = document.querySelector('.questions-field');
discussion_panel.addEventListener('click', discussionClickHandler);

function createResponse(dis_id, subject, solution, cb) {
  let rid = Date.now();
  const response = {
    email: email,
    subject: subject,
    solution: solution,
    upvote: 0,
  };
  let responses = discussions[dis_id].responses;
  if (
    responses == null ||
    Object.keys(discussions[dis_id].responses).length == 0
  ) {
    discussions[dis_id].responses = { [rid]: response };
  } else {
    // rid = Number(
    //   Object.keys(discussions[dis_id].responses)[
    //     Object.keys(discussions[dis_id].responses).length - 1
    //   ]
    // );
    // discussions[dis_id].responses[++rid] = response;
    discussions[dis_id].responses[rid] = response;
  }
  saveDiscussion('rsp-create', dis_id, cb);
  return rid;
}

function deleteResponse(dis_id, rid) {
  if (
    discussions[dis_id].responses != null &&
    Object.keys(discussions[dis_id].responses).length > 0
  ) {
    delete discussions[dis_id].responses[rid];
    saveDiscussion('rsp-delete', dis_id, () => {
      const response_element = document.getElementById(`${dis_id}:${rid}`);
      response_element.remove();
    });
  }
}

function makeResponse(dis_id, rid, subject, solution, upvote) {
  const responses_pane = document.querySelector(
    '.response-form .question-tab .responses'
  );
  const solution_by = document.createElement('span');
  if (discussions[dis_id].responses[rid].email == email) {
    solution_by.innerText = `Solution by <YOU>`;
  } else {
    solution_by.innerText = `Solution by <${discussions[dis_id].responses[rid].email}>`;
  }
  const response_div = document.createElement('div');
  response_div.className = 'response';
  response_div.id = `${dis_id}:${rid}`;
  response_div.title = discussions[dis_id].responses[rid].email;

  const response_title = document.createElement('span');
  response_title.innerHTML = subject;
  response_title.className = 'title';
  const response_desc = document.createElement('span');
  response_desc.innerHTML = solution;
  response_desc.className = 'desc';
  const options = document.createElement('span');
  options.innerHTML = `<p>${upvote}</p><i class="fa fa-arrow-up" aria-hidden="true" title="upvote" name="upvote"></i><i class="fa fa-arrow-down" aria-hidden="true" title="downvote" name="downvote"></i><i class="fa fa-trash" aria-hidden="true" title="delete" name="delete"></i>`;
  options.className = 'options';

  response_div.appendChild(solution_by);
  response_div.appendChild(response_title);
  response_div.appendChild(response_desc);
  response_div.appendChild(options);
  responses_pane.appendChild(response_div);
}

function clearResponses() {
  const responses_pane = document.querySelector(
    '.response-form .question-tab .responses'
  );
  responses_pane.innerHTML = null;
}

function loadResponses(dis_id) {
  const responsesObj = discussions[dis_id].responses;
  if (
    responsesObj != null &&
    Object.keys(discussions[dis_id].responses).length > 0
  ) {
    const sortableResponses = Object.entries(responsesObj).sort(
      (a, b) => b[1].upvote - a[1].upvote
    );
    // console.log(sortableResponses);
    sortableResponses.forEach(([rid, response]) => {
      makeResponse(
        dis_id,
        rid,
        response.subject,
        response.solution,
        response.upvote
      );
    });
  }
  //   for (let rid in discussions[dis_id].responses) {
  //     const response = discussions[dis_id].responses[rid];
  //     makeResponse(
  //       dis_id,
  //       rid,
  //       response.subject,
  //       response.solution,
  //       response.upvote
  //     );
  //   }
}

function questionTabHandler(e) {
  let task = e.target.getAttribute('name');
  if (task === 'resolve') {
    let dis_id = Number(e.target.parentNode.parentNode.id.split('q')[1]);
    deleteDiscussion(dis_id);
    toggleForm(0);
  } else if (task === 'add-response') {
    let dis_id = Number(
      e.target.parentNode.parentNode.parentNode.parentNode.id.split('q')[1]
    );

    const title = document.querySelector('.response-form-tab form input');
    const desc = document.querySelector('.response-form-tab form textarea');
    const subject = title.value;
    const solution = desc.value;
    if (subject === '' || subject === ' ' || subject === null) {
      return;
    }
    if (solution === '' || solution === ' ' || solution === null) {
      return;
    }
    const rid = createResponse(dis_id, subject, solution, () => {
      makeResponse(dis_id, rid, subject, solution, 0);
    });
    title.value = null;
    desc.value = null;
  } else if (task === 'upvote') {
    // console.log(e.target.parentNode.parentNode.id);
    const ids = e.target.parentNode.parentNode.id.split(':');
    const dis_id = Number(ids[0]);
    const rid = Number(ids[1]);
    discussions[dis_id].responses[rid].upvote += 1;

    saveDiscussion('rsp-update', dis_id, () => {
      let count = document.getElementById(
        `${e.target.parentNode.parentNode.id}`
      );
      let curr_votes = count.querySelector('.options p');
      curr_votes.innerText = discussions[dis_id].responses[rid].upvote;

      const parent = e.target.parentNode.parentNode;
      let uncle = parent.previousSibling;
      if (uncle != null) {
        let parent_votes = Number(parent.querySelector('.options p').innerText);
        let uncle_votes = Number(uncle.querySelector('.options p').innerText);
        let prv_uncle = uncle;
        while (parent_votes > uncle_votes) {
          prv_uncle = uncle;
          uncle = uncle.previousSibling;
          if (uncle == null) break;
          uncle_votes = Number(uncle.querySelector('.options p').innerText);
        }
        uncle_votes = Number(prv_uncle.querySelector('.options p').innerText);
        if (parent_votes > uncle_votes) {
          parent.remove();
          prv_uncle.parentNode.insertBefore(parent, prv_uncle);
        }
      }
    });
  } else if (task === 'downvote') {
    const ids = e.target.parentNode.parentNode.id.split(':');
    const dis_id = Number(ids[0]);
    const rid = Number(ids[1]);
    const upvotes = discussions[dis_id].responses[rid].upvote;
    if (upvotes > 0) {
      discussions[dis_id].responses[rid].upvote -= 1;

      saveDiscussion('rsp-update', dis_id, () => {
        let count = document.getElementById(
          `${e.target.parentNode.parentNode.id}`
        );
        curr_votes = count.querySelector('.options p');
        curr_votes.innerText = discussions[dis_id].responses[rid].upvote;
        // if ((count.parentNode.firstChild.querySelector(".options p").innerText))
        const parent = e.target.parentNode.parentNode;
        let uncle = parent.nextSibling;
        if (uncle != null) {
          let parent_votes = Number(
            parent.querySelector('.options p').innerText
          );
          let uncle_votes = Number(uncle.querySelector('.options p').innerText);
          let prv_uncle = uncle;
          while (uncle_votes > parent_votes) {
            prv_uncle = uncle;
            uncle = uncle.nextSibling;
            if (uncle == null) break;
            uncle_votes = Number(uncle.querySelector('.options p').innerText);
          }
          uncle_votes = Number(prv_uncle.querySelector('.options p').innerText);
          if (uncle_votes > parent_votes) {
            parent.remove();
            prv_uncle.parentNode.insertBefore(parent, prv_uncle.nextSibling);
          }
        }
      });
    }
  } else if (task === 'delete') {
    // console.log("delete");
    const ids = e.target.parentNode.parentNode.id.split(':');
    const dis_id = Number(ids[0]);
    const rid = Number(ids[1]);
    deleteResponse(dis_id, rid);
  }
}
const question_tab = document.querySelector('.response-form .question-tab');
question_tab.addEventListener('click', questionTabHandler);

let made_changes = false;
function searchHandler(e) {
  let substring = e.target.value.toLowerCase().trim();
  const not_found = document.getElementById('not-found');
  const all_questions = document.querySelector('.question-pane .all-questions');
  const questions = all_questions.childNodes;
  if (made_changes) {
    const star = document.querySelector('.search-box .starred');
    not_found.classList.add('hide');
    questions.forEach((question) => {
      if (
        (star.childNodes[1].classList.contains('hide') &&
          question.childNodes[0].childNodes[1].childNodes[0].classList.contains(
            'hide'
          )) ||
        star.childNodes[3].classList.contains('hide')
      ) {
        question.innerHTML = question.innerHTML.replaceAll('<hg>', '');
        question.innerHTML = question.innerHTML.replaceAll('</hg>', '');
        question.classList.remove('hide');
      }
    });
    made_changes = false;
  }
  if (substring != ' ' && substring != '') {
    made_changes = true;
    not_found.classList.add('hide');
    let bool = true;
    const star = document.querySelector('.search-box .starred');
    questions.forEach((question) => {
      if (
        (star.childNodes[1].classList.contains('hide') &&
          question.childNodes[0].childNodes[1].childNodes[0].classList.contains(
            'hide'
          )) ||
        star.childNodes[3].classList.contains('hide')
      ) {
        const content = question.firstChild;
        const title = content.firstChild.innerHTML;
        const desc = content.lastChild.innerHTML;
        if (
          title.toLowerCase().includes(substring) ||
          desc.toLowerCase().includes(substring)
        ) {
          bool = false;
          question.classList.remove('hide');
          let st_idx = title.toLowerCase().indexOf(substring);
          if (st_idx != -1) {
            const ori_subject = title
              .slice(st_idx, st_idx + substring.length)
              .trim();
            let re = new RegExp(
              `(?<=>(?:[^<]*?))` + ori_subject + `(?=(?:[^<]*?)<)`,
              `gi`
            );
            // let re = new RegExp(`(>[^<]*?)(${ori_subject})([^<]*?<)`, `gi`);
            content.firstChild.innerHTML = title.replace(
              re,
              (match) => `<hg>${match}</hg>`
            );
            //   `<hg>${ori_subject}</hg>`
          }

          st_idx = desc.toLowerCase().indexOf(substring);
          if (st_idx != -1) {
            const ori_question = desc.slice(st_idx, st_idx + substring.length);
            let re = new RegExp(
              `(?<=>(?:[^<]*?))` + ori_question + `(?=(?:[^<]*?)<)`,
              'gi'
            );
            content.lastChild.innerHTML = desc.replace(
              re,
              (match) => `<hg>${match}</hg>`
            );
          }
        } else {
          question.innerHTML = question.innerHTML.replaceAll('<hg>', '');
          question.innerHTML = question.innerHTML.replaceAll('</hg>', '');
          question.classList.add('hide');
        }
      }
    });
    if (bool) {
      not_found.classList.remove('hide');
    }
  }
}
discussion_panel.addEventListener('keyup', searchHandler);

function updateTimers() {
  const timers = document.querySelectorAll('.timer');
  timers.forEach((timer) => {
    let timestamp = Number(timer.getAttribute('timestamp'));
    timestamp = Date.now() - timestamp;
    const seconds_gone = Math.floor(timestamp / 1000);
    if (seconds_gone < 60) {
      timer.innerText = 'Added few seconds ago.';
    } else if (seconds_gone < 3600) {
      timer.innerText = `Added ${Math.floor(seconds_gone / 60)} minutes ago.`;
    } else if (seconds_gone < 3600 * 24) {
      timer.innerText = `Added ${Math.floor(
        seconds_gone / (60 * 60)
      )} hours ago.`;
    } else {
      timer.innerText = `Added ${Math.floor(
        seconds_gone / (60 * 60 * 24)
      )} days ago.`;
    }
  });
}
setTimeout(updateTimers, 100);
setInterval(updateTimers, 1000 * 10); // Update Timer runs after 10 secs.
