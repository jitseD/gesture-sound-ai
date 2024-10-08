
// --- selectors --- //

const $instructionBlocks = document.querySelectorAll(`.instruction__block`);


// --- function --- //

const toggleVisibilityHandler = (e) => {
    const $currentChildren = e.currentTarget.children;

    $instructionBlocks.forEach(block => {
        const $children = block.children
        for (let i = 1; i < $children.length -1; i++) {
            $children[i].classList.add(`hide`);
        }
        $children[$children.length - 1].classList.remove(`instruction__toggle--active`);
    });
    
    for (let i = 1; i < $currentChildren.length -1; i++) {
        $currentChildren[i].classList.remove(`hide`);
    }
    $currentChildren[$currentChildren.length - 1].classList.add(`instruction__toggle--active`);

}


// --- init --- //

const init = () => {
    $instructionBlocks.forEach(block => {
        block.addEventListener(`click`, toggleVisibilityHandler)
    });
}

init();
