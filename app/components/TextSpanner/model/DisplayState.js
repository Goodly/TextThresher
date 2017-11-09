import { Record } from 'immutable';

import { Block } from './Block';

import generateRandomKey from '../utils/generateRandomKey';

const debug = require('debug')('thresher:TextSpanner');

const defaultDisplayStateRecord = {
  key: '',
};

const DisplayStateRecord = Record(defaultDisplayStateRecord);

export class DisplayState extends DisplayStateRecord {
  constructor() {
    super({key: generateRandomKey()});
    this._blockList = [];
    this.setDisplayBlocks = this._setDisplayBlocks.bind(this);
    this.getBlockList = this._getBlockList.bind(this);
    this.setDisplayLayers = this._setDisplayLayers.bind(this);
    this._displayLayerArray = [];
    this.generateAnnotationMap = this._generateAnnotationMap.bind(this);
    this.getOrderedLayersFor = this._getOrderedLayersFor.bind(this);
    // Will be a map keyed on annotation.key returning a layer.
    this._annotationToLayerMap = null;
  }

  _getBlockList(text) {
    return this._blockList;
  }

  _setDisplayBlocks(blockList) {
    this._blockList = Array.from(blockList);
    return this;
  }

  _setDisplayLayers(layerArray) {
    // Reset cache
    this._annotationToLayerMap = null;
    this._displayLayerArray = Array.from(layerArray);
  }

  /* The main job of DisplayState is to track an ordered
   * list of layers. (Layers have no order in EditorState.)
   * This method goes through the layers in this DisplayState
   * instance and creates a map from annotation.key to an object
   * with an integer for the order of the layer, the layer object,
   * and the annotation object.
   */
  _generateAnnotationMap() {
    let annoToLayer = new Map();
    this._displayLayerArray.forEach( (layer, order) => {
      for (let annotation of layer.getAnnotationList()) {
        annoToLayer.set(annotation.key, {order, layer, annotation});
      }
    });
    this._annotationToLayerMap = annoToLayer;
  }

  /* Takes an array of annotation object keys.
   * Returns an ordered list of objects with the order integer,
   * the layer object, and the annotation object.
   * Note that a layer could appear more than once if a span has
   * overlapping annotations from that layer.
   */
  _getOrderedLayersFor(spanAnnotations) {
    // Check if map of annotations to layers needs to be generated
    if (this._annotationToLayerMap === null) {
      this.generateAnnotationMap();
    };
    let annoToLayer = this._annotationToLayerMap;
    let orderedLayers = [];
    for (let annotationKey of spanAnnotations) {
      // If annotation not in map, the layer is not included for styling
      if (annoToLayer.has(annotationKey)) {
        orderedLayers.push(annoToLayer.get(annotationKey));
      };
    };
    orderedLayers.sort( (a, b) => a.order - b.order );
    return orderedLayers;
  }
}
