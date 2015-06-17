# jQuery Highlighter Plugin

## Demo
[Demo Highlighter](https://jarga.github.io/jQuery-Highlighter/)

## Description
Highligther plugin used to highlight arbitrary sets of text on the screen or used to create a "Hot Text" area in which everything in the area can be highlighted by selecting a block of text

## Parameters

* **highlightClass (Default = 'highlight'):**  
  Defines the class given to the element used to surround the selected content.  This class is used to apply the background color.
* **mode (Default = 'standard') - AcceptedValues: 'standard' | 'hottext':**  
  Mode of highlighting to use, standard mode is a basic toggle on/off highlighter, Hot text mode activates a particular element and allows automatic highlighting of content in that element
* **highlightCursor (Default = 'text'):**  
  Cursor type to use when the highlight mode is active.
* **unhighlightCursor (Default = 'pointer'):**  
  Cursor type to use with the unhighlight mode is active
* **toggleHighlightSelector (Default = '.highlighter-toggle')**  
  In Standard mode this is the jQuery selector for the element(s) that you want to use to toggle the highlighter on/off
* **removeHighlightSelector (Default = '.erase-highlight'):**  
  jQuery selector for the element(s) that you want to use to toggle the unhighlighting mode on/off
* **hotTextContainerSelector (Default = '.hot-text-container'):**  
  In Hot text mode this is the jQuery selector for the element(s) that you want to be 'Hot Text' areas
* **hotTextOutputContainerSelector (Default = '.hot-text-answer-container'):**  
  In HotText mode if this is populated then the highlighted content will be written to the configured value/display elements
* **selectionsValueSelector (Default = '.selected-text-value'):**  
  If hotTextOutputContainerSelector is set this is the selector to the value inputs that can be used in web requests
* **selectionsDisplaySelector (Default = '.selected-text-display'):**  
  If hotTextOutputContainerSelector is set this is the selector to a sibling of the selectionsValueSelector used for display purposes

### Standard Mode

```javascript
$.highlighter({'toggleHighlightSelector': '#toggle_highlighter','removeHighlightSelector': '#remove_highlight'});
```

### HotText Mode

```javascript
$.highlighter({
             'highlightClass': 'answer-highlight',
             'mode': 'hottext',
             'removeHighlightSelector': '#remove_answer_highlight',
             'hotTextContainerSelector': '#hot_selection_container',
             'hotTextOutputContainerSelector': '#selected_answers',
             'selectionsValueSelector': 'input.selected-answer-value',
             'selectionsDisplaySelector': '.selected-answer-display'
         });
```

## Requirements

### Mandatory requirements
* [jQuery](https://jquery.com/) Only verified on v. 1.11+ (Probably works on far more)

## CSS Usage

```css
.highlight{
    background-color: yellow;
}
```

## Browsers

### Desktop browsers
Limited browser testing so far, verified versions will go here

* Google Chrome - v. ?
* Apple Safari - v. ?
* Mozilla Firefox - v. ?
* Opera - v. ?
* Microsoft Internet Explorer - v. ?

## License
Released under the [MIT license](http://www.opensource.org/licenses/MIT).