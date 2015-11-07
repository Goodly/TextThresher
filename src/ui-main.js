// #TODO: PORT WHAT IS NEEDED TO THE NEW REACT APP
"use strict";

var adder = annotator.ui.adder;
var editor = aca.ui.editor;
var highlighter = annotator.ui.highlighter;
var textselector = annotator.ui.textselector;
var viewer = annotator.ui.viewer

// Returns the absolute position of the mouse relative to the top-left rendered
// corner of the page (taking into account padding/margin/border on the body
// element as necessary).
function mousePosition(event) {
    var body = document.body;
    var offset = {top: 0, left: 0};

    if ($(body).css('position') !== "static") {
        offset = $(body).offset();
    }

    return {
        top: event.pageY - offset.top,
        left: event.pageX - offset.left
    };
}

// annotationFactory returns a function that can be used to construct an
// annotation from a list of selected ranges.
function annotationFactory(contextEl, ignoreSelector) {
    return function (ranges) {
        var text = [],
            serializedRanges = [];

        for (var i = 0, len = ranges.length; i < len; i++) {
            var r = ranges[i];
            text.push(String.prototype.trim(r.text()));
            serializedRanges.push(r.serialize(contextEl, ignoreSelector));
        }

        return {
            quote: text.join(' / '),
            ranges: serializedRanges
        };
    };
}

/**
 * function:: main([options])
 *
 * A module that provides a default user interface for Annotator that allows
 * users to create annotations by selecting text within (a part of) the
 * document.
 *
 * Example::
 *
 *     app.include(annotator.ui.main);
 *
 * :param Object options:
 *
 *   .. attribute:: options.element
 *
 *      A DOM element to which event listeners are bound. Defaults to
 *      ``document.body``, allowing annotation of the whole document.
 *
 *   .. attribute:: options.editorExtensions
 *
 *      An array of editor extensions. See the
 *      :class:`~annotator.ui.editor.Editor` documentation for details of editor
 *      extensions.
 *
 *   .. attribute:: options.viewerExtensions
 *
 *      An array of viewer extensions. See the
 *      :class:`~annotator.ui.viewer.Viewer` documentation for details of viewer
 *      extensions.
 *
 */
function main(options) {
    if (typeof options === 'undefined' || options === null) {
        options = {};
    }

    options.element = options.element || document.body;
    options.editorExtensions = options.editorExtensions || [];
    options.viewerExtensions = options.viewerExtensions || [];

    // Local helpers
    var makeAnnotation = annotationFactory(options.element, '.annotator-hl');

    // Object to hold local state
    var s = {
        interactionPoint: null
    };

    function start(app) {
        var ident = app.registry.getUtility('identityPolicy');
        var authz = app.registry.getUtility('authorizationPolicy');

        s.adder = new adder.Adder({
            onCreate: function (ann) {
                app.annotations.create(ann);
            }
        });
        s.adder.attach();

        s.editor = new editor({
            extensions: options.editorExtensions
        });

        s.highlighter = new highlighter.Highlighter(options.element);

        s.textselector = new textselector.TextSelector(options.element, {
            onSelection: function (ranges, event) {
                if (ranges.length > 0) {
                    var annotation = makeAnnotation(ranges);
                    s.interactionPoint = mousePosition(event);
                    s.adder.load(annotation, s.interactionPoint);
                } else {
                    s.adder.hide();
                }
            }
        });

        s.viewer = new viewer.Viewer({
            onEdit: function (ann) {
                // Copy the interaction point from the shown viewer:
                s.interactionPoint = $(s.viewer.element)
                                         .css(['top', 'left']);

                app.annotations.update(ann);
            },
            onDelete: function (ann) {
                app.annotations['delete'](ann);
            },
            permitEdit: function (ann) {
                return authz.permits('update', ann, ident.who());
            },
            permitDelete: function (ann) {
                return authz.permits('delete', ann, ident.who());
            },
            autoViewHighlights: options.element,
            extensions: options.viewerExtensions
        });
        s.viewer.attach();

    }

    return {
        start: start,

        destroy: function () {
            s.adder.destroy();
            s.editor.destroy();
            s.highlighter.destroy();
            s.textselector.destroy();
            s.viewer.destroy();
            removeDynamicStyle();
        },

        annotationsLoaded: function (anns) { s.highlighter.drawAll(anns); },
        annotationCreated: function (ann) { s.highlighter.draw(ann); },
        annotationDeleted: function (ann) { s.highlighter.undraw(ann); },
        annotationUpdated: function (ann) { s.highlighter.redraw(ann); },

        beforeAnnotationCreated: function (annotation) {
            // Editor#load returns a promise that is resolved if editing
            // completes, and rejected if editing is cancelled. We return it
            // here to "stall" the annotation process until the editing is
            // done.
            return s.editor.load(annotation, s.interactionPoint);
        },

        beforeAnnotationUpdated: function (annotation) {
            return s.editor.load(annotation, s.interactionPoint);
        }
    };
}

window.aca = {};
window.aca.ui = {};
window.aca.ui.main = main;
