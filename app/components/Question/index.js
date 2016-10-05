import React from 'react';

/* component styles */
import { styles } from './styles.scss';

/* stateless react component */
const Question = ({question}) => {
  console.log(question);
    return (
    <div className={`${styles}`}>
    <div>{question.text}</div>
    </div>
  )
}

export default Question
