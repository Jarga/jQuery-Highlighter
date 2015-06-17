/*
 * jQuery Highlighter Plugin
 * https://github.com/jarga/jQuery-Highlighter
 *
 * Copyright 2015, Sean McAdams
 * Originally Designed for http://www.writescore.com
 * https://www.sean-mcadams.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

(function($) {
     var instanceCounter = 0;
     $.highlighter = function(options) {
         var highlight = {
             options: $.extend({
                 'instance': instanceCounter++,
                 'highlightClass': 'highlight',
                 'mode': 'standard',
                 'highlightCursor': 'text',
                 'unhighlightCursor': 'pointer',
                 'toggleHighlightSelector': '.highlighter-toggle', 
                 'removeHighlightSelector': '.erase-highlight', 
                 'hotTextContainerSelector': '.hot-text-container',
                 'hotTextOutputContainerSelector': '.hot-text-answer-container', 
                 'selectionsValueSelector': '.selected-text-value', 
                 'selectionsDisplaySelector': '.selected-text-display'
             }, options),
             getWrappingElement: function() {
                 var wrappingElement = document.createElement('span');
                 wrappingElement.className = highlight.options.highlightClass;
                 return wrappingElement;
             },
             getCurrentSelection: function() {
                 var selection;
                 if (window.getSelection) {
                     selection = window.getSelection();
                 } else if (document.getSelection) {
                     selection = document.getSelection();
                 } else if (typeof document.selection != "undefined") { //Older IE Shim
                     selection = document.selection;
                 } else {
                     throw "Highlighting not supported in this browser."
                 }
                 return selection;
             },
             getFirstElementAtSelection: function() {
                 var node = highlight.getCurrentSelection().anchorNode;
                 if (node) {
                     return (node.nodeType == 3 ? node.parentNode : node);
                 }
             },
             unhighlight: function(element) {
                 //If no element is given see if there is an element at the mouse focus
                 if (!element) {
                     element = highlight.getFirstElementAtSelection();
                     if (!element) {
                         return;
                     }
                 }

                 //Find first highlight node in the DOM
                 var target = $(element);
                 if (target.attr('class') !== highlight.options.highlightClass) {
                     target = target.closest('.' + highlight.options.highlightClass);
                 }

                 //Unwrap contents from highlight node
                 var contents = target.html();
                 var parent = target.parent()[0];
                 target.replaceWith(contents);
                 parent.normalize();
             },
             highlightRange: function(targetRange) {
                 //If provided a range just wrap that range
                 if (targetRange) {
                     targetRange.surroundContents(highlight.getWrappingElement());
                 }
             },
             highlightSelection: function() {
                 var selection = highlight.getCurrentSelection()
    	         
                 //if nothing is selected do nothing
                 if(selection.isCollapsed){
                     return;
                 }  
                   
                 var targetRange = selection.getRangeAt(0);

                 if (typeof(targetRange) !== 'undefined' && !targetRange.collapsed) {

                     var tempNode;
                     var topLevelParent = targetRange.commonAncestorContainer;

                     var allSelectedHighlightNodes = [];

                     if (topLevelParent.nodeType != 3) {
                         var allWithinRangeParent = topLevelParent.getElementsByTagName("*");
                         for (var i = 0, el; el = allWithinRangeParent[i]; i++) {
                             // The second parameter says to include the element 
                             // even if it's not fully selected
                             if (selection.containsNode(el, true)) {
                                 if (el.className === highlight.options.highlightClass) {
                                     allSelectedHighlightNodes.push(el);
                                 }
                             }
                         }
                     }

                     //Text is within single node
                     if (targetRange.startContainer.parentNode == targetRange.endContainer.parentNode) {
                         //only highlight if the parent node isn't already highlighted
                         if (targetRange.startContainer.parentNode.className !== highlight.options.highlightClass) {
                             highlight.highlightRange(targetRange);
                         }
                     } else {

                         //Cannot highlight across nodes since that would destroy DOM integrity
                         if (targetRange.startContainer.parentNode.className === highlight.options.highlightClass) {
                             targetRange.setStartBefore(targetRange.startContainer.parentNode);
                         } else if (targetRange.startContainer.parentNode !== topLevelParent) {
                             alert('Unable to highlight selection.');
                             selection.removeAllRanges();
                             return;
                         }

                         //Cannot highlight across nodes since that would destroy DOM integrity
                         if (targetRange.endContainer.parentNode.className === highlight.options.highlightClass) {
                             //create temp node because setEndAfter does not properly expand to the end of the partially selected node
                             tempNode = document.createElement('span');
                             $(tempNode).insertAfter(targetRange.endContainer.parentNode);
                             targetRange.setEndAfter(tempNode);
                         } else if (targetRange.endContainer.parentNode !== topLevelParent) {
                             alert('Unable to highlight selection.');
                             selection.removeAllRanges();
                             return;
                         }

                         //reset selection to new range
                         selection.removeAllRanges();
                         selection.addRange(targetRange);

                         highlight.highlightRange(targetRange);

                     }

                     //remove redundant highlights
                     allSelectedHighlightNodes.forEach(function(element) {
                         var child = $(element);
                         var text = child.text();
                         child.replaceWith(text);
                     }, this);

                     //remove unneeded end node and clean text nodes
                     if (tempNode) {
                         tempNode.parentNode.removeChild(tempNode);
                     }
                     if (topLevelParent.nodeType != 3) {
                         topLevelParent.normalize();
                     }

                     //clear selection now that highlight process is complete
                     selection.removeAllRanges();
                 }
             },
             setHighlightAnswers: function($outputContainer, $hotTextContainer) {
                 if ($outputContainer && $hotTextContainer) {
                     var answerElements = $hotTextContainer.find('.' + highlight.options.highlightClass);
                     var outputElements = $outputContainer.find(highlight.options.selectionsValueSelector);
                     var i = 0;

                     //set output elements display and values to the selected content
                     for (var i = 0; i < outputElements.length; i++) {
                         var element = $(outputElements[i]);
                         var display = element.siblings(highlight.options.selectionsDisplaySelector);

                         //if an answer exists for the output set the data, otherwise clear the output
                         if (i < answerElements.length) {
                             var answer = $(answerElements[i]).text();
                             if (display.length > 0) {
                                 $(display[0]).text(answer);
                             }
                             element.val(answer);
                         } else {
                             if (display.length > 0) {
                                 $(display[0]).text('');
                             }
                             element.val('');
                         }
                     }

                     if (i < answerElements.length) {
                         alert('Too many answers selected, only ' + outputElements.length + ' answers can be selected.');
                     }
                 }
             },
             userCanSelectMoreAnswers: function($outputContainer, $hotTextContainer) {
                 if ($outputContainer && $hotTextContainer) {
                     var answerElements = $hotTextContainer.find('.' + highlight.options.highlightClass);
                     var outputElements = $outputContainer.find(highlight.options.selectionsValueSelector);

                     if (answerElements.length < outputElements.length) {
                         return true;
                     } else if (answerElements.length === outputElements.length) {
                         //If all output elemets are used check to see if our current selection includes a previous answer
                         //If it does then the selection can continue and expand to the newly selected contents
                         var selection = highlight.getCurrentSelection();
                         var targetRange = selection.getRangeAt(0);

                         var topLevelParent = targetRange.commonAncestorContainer;
                         if (topLevelParent.nodeType != 3) {
                             var allWithinRangeParent = topLevelParent.getElementsByTagName("*");
                             for (var i = 0, el; el = allWithinRangeParent[i]; i++) {
                                 // The second parameter says to include the element 
                                 // even if it's not fully selected
                                 if (selection.containsNode(el, true)) {
                                     if (el.className === highlight.options.highlightClass) {
                                         return true;
                                     }
                                 }
                             }
                         }
                         return false;
                     } else {
                         return false;
                     }
                 }
                 return true;
             },
             activateHotSelectionCursors: function() {
                 $(document).on('mouseover.hotselections' + highlight.options.instance, highlight.options.hotTextContainerSelector, function() {
                     $('body').css('cursor', highlight.options.highlightCursor);
                 });
                 $(document).on('mouseout.hotselections' + highlight.options.instance, highlight.options.hotTextContainerSelector, function() {
                     $('body').css('cursor', 'default');
                 });
             },
             deactivateHotSelectionCursors: function() {
                 $(document).off('mouseover.hotselections' + highlight.options.instance);
                 $(document).off('mouseout.hotselections' + highlight.options.instance);
             },
             persistHighlight: function() {
                 //TODO: Use window. to store highlight for current window/tab and/or use HTML5 storage based on instance#
                 //Standard mode highlights will be harder to persist without storing container information
             },
             restorePersistedHighlight: function() {
                 //TODO: Pull saved data from window. and/or HTML5 storage based on instance#
             },
             initializeStandard: function() {
                 var highlighterToggle = false;
                 $(document).on('click', highlight.options.removeHighlightSelector, function() {
                     $('body').css('cursor', highlight.options.unhighlightCursor);
                     
                     $(document).off('mouseup.highlighter');
                     highlighterToggle = false;   
                     
                     $(document).off('click.highlighter');
                     $(document).on('click.highlighter', function() {
                         $('body').css('cursor', 'default');

                         try {
                             highlight.unhighlight(null);
                         } catch (e) {
                             if (console) {
                                 console.log(e);
                             }
                         }
                         $(document).off('click.highlighter');
                     });
                 });
                 $(document).on('click', highlight.options.toggleHighlightSelector, function() {
                     highlighterToggle = !highlighterToggle;
                     if(highlighterToggle){
                         $('body').css('cursor', highlight.options.highlightCursor);
        	               
                         $(document).off('mouseup.highlighter');
                         $(document).on('mouseup.highlighter', function() {
                             try {
                                 highlight.highlightSelection();
                             } catch (e) {
                                 if (console) {
                                     console.log(e);
                                 }
                             }
                         });
                     } else {
                         $('body').css('cursor', 'default');
                         $(document).off('mouseup.highlighter');
                     }
                 });
             },
             initializeHotText: function() {
                 var $hotTextContainer = $(highlight.options.hotTextContainerSelector);

                 if ($hotTextContainer.length < 1) {
                     throw "Invalid hot text container defined with '" + highlight.options.hotTextContainerSelector + "' selector. Element does not exist."
                 }
                 var outputContainerDefined = !!highlight.options.hotTextOutputContainerSelector;
                 var $outputContainer = outputContainerDefined ? $(highlight.options.hotTextOutputContainerSelector) : null;

                 if (outputContainerDefined && $outputContainer.length < 1) {
                     throw "Invalid output container defined with '" + highlight.options.hotTextOutputContainerSelector + "' selector. Element does not exist."
                 }

                 highlight.activateHotSelectionCursors();
                 //Answer Highlighter
                 $(document).on('click', highlight.options.removeHighlightSelector, function() {
                     highlight.deactivateHotSelectionCursors();
                     $('body').css('cursor', highlight.options.unhighlightCursor);

                     $(document).off('click.highlighter');
                     $(document).on('click.highlighter', function() {
                         $('body').css('cursor', 'default');

                         try {
                             highlight.unhighlight(null);
                         } catch (e) {
                             if (console) {
                                 console.log(e);
                             }
                         }
                         $(document).off('click.highlighter');
                         highlight.setHighlightAnswers($outputContainer, $hotTextContainer);
                         highlight.activateHotSelectionCursors();
                     });
                 });

                 $(document).on('mousedown', highlight.options.hotTextContainerSelector, function() {

                     $(document).off('mouseup.highlighter');
                     $(document).on('mouseup.highlighter', highlight.options.hotTextContainerSelector, function() {
                         var selection = highlight.getCurrentSelection();

                         var targetRange = selection.getRangeAt(0);

                         var userSelectedContent = typeof(targetRange) !== 'undefined' && !targetRange.collapsed;
                         if (userSelectedContent && highlight.userCanSelectMoreAnswers($outputContainer, $hotTextContainer)) {

                             try {
                                 highlight.highlightSelection();
                             } catch (e) {
                                 if (console) {
                                     console.log(e);
                                 }
                             }
                             $(document).off('mouseup.highlighter');
                             highlight.setHighlightAnswers($outputContainer, $hotTextContainer);
                         } else if (userSelectedContent) {
                             alert('All answers have already been selected, please deselect an answer before selecting a new one.');
                             selection.removeAllRanges();
                         }
                     });
                 });
             }
         };

         if (highlight.options.mode === 'standard') {
             highlight.initializeStandard();
         } else if (highlight.options.mode === 'hottext') {
             highlight.initializeHotText();
         }
     };
 })(jQuery);