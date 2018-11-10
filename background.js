"use strict";

//var browser = browser || chrome

browser.commands.onCommand.addListener(async function(command) {
    if (command !== "focus") {
        console.error("Command is not `focus`!", command)
        return
    }

    let activeTab =
        (await browser.tabs.query({active: true, currentWindow: true}))[0]
    if (activeTab.id === browser.tabs.TAB_ID_NONE) {
        console.error("Tab ID is none!", activeTab.id)
        return
    }

    browser.tabs.executeScript(activeTab.id, {
        code: focusOnSearch.toString() + `\nfocusOnSearch()`
    })
})


// How do we choose which <input> element to focus on?
//   Do we use regular expressions?
//                              Don't be silly!
//            Do we use advanced herustics?
//                                        Of course not!
//       Do we use neural networks?
//                                  Sensible but not really.
//
// We simply pick the element with the highest number of occurrences of "search"
// (case insensitive) in its outerHTML
//                                                   ...and it works like charm!
//
// - In case of a draw, the first one wins.
// - Only the <input> elements whose "type" is 'text', 'search', or whose 'type'
//   attribute is ommitted (as it defaults to 'text') are considered.
// - We filter the elements whose offsetParent is null (since that indicates
//   that the element is not displayed).
function focusOnSearch() {
    const count = (str) => {
        return (str.match(/search/ig) || []).length
    }

    let inputs =
        [...document.querySelectorAll(
            "input[type='search'], input[type='text'], input:not([type])"
        )]
        .filter(x => x.offsetParent)
    if (inputs.length === 0)
        return

    let best = inputs[0]
    for (let input of inputs)
        if (count(input.outerHTML) > count(best.outerHTML))
            best = input

    best.select()
    best.focus()
    best.scrollIntoView(true)
}
