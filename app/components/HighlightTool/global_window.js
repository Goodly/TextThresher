import React, Component from 'react';

class selectionObj extends Component {
  var selectionObj = {
    anchorNode: 0,
    anchorOffset: 0,
    extentNode: 0,
    extentOffset: 0,
    text: ""
  }
  function setAN(an) {
    selectionObj.anchorNode = an;
  }
  function setAO(ao) {
    selectionObj.anchorNode = ao;
  }
  function setEN(en) {
    selectionObj.anchorNode = en;
  }
  function setEO(eo) {
    selectionObj.anchorNode = eo;
  }
  function setText(text) {
    selectionObj.anchorNode = text;
  }
  function returnObj() {
    return selectionObj;
  }
  function toString() {
    return selectionObj.text;
  }
}

export default class test_window extends Component {
  var selObj = selectionObj();

  function setSelection(an, ao, en, eo, t) {
    selObj.setAN(an);
    selObj.setAO(ao);
    selObj.setEN(en);
    selObj.setEO(eo);
    selObj.setText(t);
  }

  function getSelection() {
    return selObj.returnObj()
  }
}
