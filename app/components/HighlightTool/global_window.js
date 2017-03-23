import React, {Component} from 'react';

class selectionObj extends Component {
  /*var selectionObj = {
    anchorNode: 0,
    anchorOffset: 0,
    extentNode: 0,
    extentOffset: 0,
    text: ""
  }*/
  constructor(props) {
    super(props);
    this.state = {
      anchorNode: 0,
      anchorOffset: 0,
      extentNode: 0,
      extentOffset: 0,
      text: ""
    };
  }

  setAN(an) {
    this.state.anchorNode = an;
  }
  setAO(ao) {
    this.state.anchorNode = ao;
  }
  setEN(en) {
    this.state.anchorNode = en;
  }
  setEO(eo) {
    this.state.anchorNode = eo;
  }
  setText(text) {
    this.state.anchorNode = text;
  }
  returnObj() {
    return this.state;
  }
  toString() {
    return this.state.text;
  }
}

export default class test_window extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selObj: selectionObj()
    };
  }

   setSelection(an, ao, en, eo, t) {
    this.state.selObj.setAN(an);
    this.state.selObj.setAO(ao);
    this.state.selObj.setEN(en);
    this.state.selObj.setEO(eo);
    this.state.selObj.setText(t);
  }

   getSelection() {
    return this.state.selObj.returnObj()
  }
}
