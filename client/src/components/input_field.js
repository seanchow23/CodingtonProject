import React from "react";

export default function InputField({ id, type, value, checked, onChange, children }) {
    return (
      <div>
        <label htmlFor={id}>{children}</label>
        <input type={type} id={id} name={id} value={value} checked={checked} onChange={onChange} required={type !== 'checkbox'} />
      </div>
    );
}