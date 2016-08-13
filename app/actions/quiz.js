export NEW_QUESTION = 'NEW_QUESTION';
export SWITCH_ACTIVE_QUESTION = "SWITCH_ACTIVE_QUESTION"

export function newQuestion(question) {
    return { 
        type: NEW_QUESTION,
        question
    }
}

export function switchActiveQuestion(id) {
    return {
        type: SWITCH_ACTIVE_QUESTION,
        newId: id + 1
    }
}