export class EditorState {
  constructor() {
    this.createDisplayState = this._createDisplayState.bind(this);
  }

  static createEmpty() {
    return new EditorState();
  }

  _createDisplayState() {
    return null;
  }
}
