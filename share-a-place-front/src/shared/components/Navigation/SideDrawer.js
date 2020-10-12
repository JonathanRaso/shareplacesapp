import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import './SideDrawer.css';

const SideDrawer = ({children, show, onClick}) => {
  const content = (
    <CSSTransition 
      in={show} 
      timeout={200} 
      classNames="slide-in-left" 
      mountOnEnter 
      unmountOnExit
    >
      <aside className="side-drawer" onClick={onClick}>{children}</aside>
    </CSSTransition>
  );

  return(
    {/* We use ReactDOM.createPortal to create a "portal" and display this element outside of the root div. #drawer-hook is inside the index.html file */},
    ReactDOM.createPortal(content, document.getElementById('drawer-hook'))
  );

};

export default SideDrawer;