### Webserver
I threw a quick python webserver up on heroku and checked it into the repo in the web_server directory. It is currently running at [text-thresher.herokuapp.com](http://text-thresher.herokuapp.com), and its API looks like:

* GET /tasks : returns the sample data as a JSON blob (see below for format). You'll get a new random unique tid (TUA-id) in the data each time this is called.

* POST /tasks: stores JSON results as a simple blob. Should be called with data 'tid': the tid of this task, and 'data': the JSON blob of the results. We haven't settled on a format for the results yet--we're hoping it will correspond closely to the format of the data you collect in the interface, so you should take the lead on it's definition.

* GET /tasks/submitted: returns all JSON blobs you've posted. If a 'tid' url parameter is passed, this will only return the relevant blob.

* POST /tasks/reset: deletes all submitted blobs to clean things up.

### Data Format
The data you'll get for a single TUA task comes as a JSON blob. JSON is fairly self-documenting, so I'll only cover the important stuff below:

* "text": this is the full text of the current article.

* "tua": this key stores information about the text relevant to the current task. "tua.id" is the task's unique id (which I called a tid above in the webserver), and "tua.offsets" is a list of start/end character indexes in the article text corresponding to the TUA

* "glossary": contains the terms users might need to know to complete the task. Whenever a term in the glossary appears in the article or question/answer-choice text, it should be linked to the corresponding entry.

* "topics": this contains the logic the questions corresponding to each topic. Each topic has a name and a list of questions.

* "questions": Each question has the following attributes:
    * "top": if true, this question lives at the top of the tree (i.e. it should appear initially in the interface)

    * "id": A unique identifier for each question. This will be important in a minute.

    * "type": the type of question. The current sample only has multiple choice, but we might need to handle any of the standard question types.

    * "answers": a list of answer choices. Each choice has text an a unique id.

    * "dependencies": this is how we are encoding question logic. A dependency has an "if" id and a "then" id. The "if" id might belong to either a question or an answer choice. If it belongs to a question, then whenever the user answers that question, the question pointed to by "then" should become active and require an answer. If the "if" id belongs to an answer choice, the "then" question should only become active if the user picks that answer choice when answering the question.
