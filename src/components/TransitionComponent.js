import React from "react";
import { Transition } from 'react-transition-group';

const duration = 300;

const defaultStyle = {
    transition: `height ${duration}ms ease-in-out`,
    height: '0vh',
    flexFlow: "row wrap",
    justifyContent: "space-evenly",
}

const transitionStyles = {
    entering: { height: '20vh' },
    entered: { height: '20vh' },
    exiting: { height: '0vh' },
    exited: { height: '0vh' },
};


export const TransitionComponent = (props) => {
    return (
        <Transition in={props.visible} timeout={duration}>
            {state => (
                <div style={{
                    ...defaultStyle,
                    ...props.styles,
                    ...transitionStyles[state]
                }}>
                    {props.children}
                </div>
            )}
        </Transition>
    )
}

