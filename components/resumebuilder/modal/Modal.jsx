// CustomModal.js
import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Important for accessibility

const CustomModal = ({ isOpen, onClose, contentList, addItem, removeItem }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Content Modal"
    >
      <h2>Content List</h2>
      <button onClick={onClose}>Close</button>
      <ul>
        {contentList.map((item) => (
          <li key={item}>
            {item}
            <button onClick={() => addItem(item)}>+</button>
            <button onClick={() => removeItem(item)}>-</button>
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default CustomModal;
