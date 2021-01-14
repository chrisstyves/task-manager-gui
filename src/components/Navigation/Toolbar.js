import React from 'react';

const toolbar = (props) => {
    let buttonText = 'LOG IN';
    let createAcctButton = null;
    let acctMgmtButton = null;

    if (props.loggedIn) {
        buttonText = 'LOG OUT';
        acctMgmtButton = <button onClick={props.accountPanel}>ACCOUNT...</button>
    }
    else {
        createAcctButton = <button onClick={props.createAcct}>CREATE AN ACCOUNT</button>;
    }

    return (
        <header>
            {createAcctButton}
            <button onClick={props.auth}>{buttonText}</button>
            {acctMgmtButton}
        </header>
    );
}

export default toolbar;