import React from 'react';

import './Input.css';

const Input = ({element, id, label, type, placeholder, rows}) => {
  const elementType = element === 'input' ? (
    <input id={id} type={type} placeholder={placeholder} /> 
  ) : (
    <textarea id={id} rows={rows || 3}/>
  ); 

  return (
    <div className={`form-control `}>
      <label htmlFor={id}>{label}</label>
      {elementType}
    </div>
  );
};

export default Input;