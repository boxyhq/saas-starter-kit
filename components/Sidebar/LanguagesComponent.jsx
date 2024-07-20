/* eslint-disable i18next/no-literal-string */
import React, { useState, useContext } from 'react';
import {
  Button,
  Form,
  ListGroup,
  InputGroup,
  FloatingLabel,
} from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ResumeContext from '@/components/Context/ResumeContext';

const LanguagesComponent = ({ onBack }) => {
  const { formData, setFormData } = useContext(ResumeContext);
  const [newLanguage, setNewLanguage] = useState('');
  const [title, setTitle] = useState(formData.languages.title || '');
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [editedLanguage, setEditedLanguage] = useState('');

  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      const updatedLanguages = [
        ...formData.languages.technology,
        {
          id: `${formData.languages.technology.length + 1}`,
          name: newLanguage.trim(),
        },
      ];
      setFormData({
        ...formData,
        languages: { title: title, technology: updatedLanguages },
      });
      setNewLanguage('');
    }
  };

  const handleDeleteLanguage = (id) => {
    const updatedLanguages = formData.languages.technology.filter(
      (language) => language.id !== id
    );
    setFormData({
      ...formData,
      languages: { title: title, technology: updatedLanguages },
    });
  };

  const handleEditLanguage = (id, name) => {
    setEditingLanguage(id);
    setEditedLanguage(name);
  };

  const handleUpdateLanguage = (id) => {
    const updatedLanguages = formData.languages.technology.map((language) =>
      language.id === id ? { ...language, name: editedLanguage } : language
    );
    setFormData({
      ...formData,
      languages: { title: title, technology: updatedLanguages },
    });
    setEditingLanguage(null);
    setEditedLanguage('');
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedLanguages = Array.from(formData.languages.technology);
    const [movedLanguage] = reorderedLanguages.splice(result.source.index, 1);
    reorderedLanguages.splice(result.destination.index, 0, movedLanguage);

    setFormData({
      ...formData,
      languages: { title: title, technology: reorderedLanguages },
    });
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setFormData({
      ...formData,
      languages: { ...formData.languages, title: e.target.value },
    });
  };

  return (
    <div>
      <div className="basic-details">
        <h2
          className="back-title mb-5"
          onClick={onBack}
          style={{ cursor: 'pointer' }}
        >
          &larr; Skills and expertise
        </h2>
      </div>
      <div className="mb-3">
        <FloatingLabel controlId="floatingInput" label="Name" className="mb-3">
          <Form.Control
            type="text"
            placeholder="Change Skills title based on your choice .."
            value={title}
            onChange={handleTitleChange}
          />
        </FloatingLabel>
      </div>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="languages">
          {(provided) => (
            <ListGroup {...provided.droppableProps} ref={provided.innerRef}>
              {formData.languages.technology.map(({ id, name }, index) => (
                <Draggable key={id} draggableId={id} index={index}>
                  {(provided) => (
                    <ListGroup.Item
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {editingLanguage === id ? (
                        <>
                          <InputGroup className="flex-grow-1 mr-2">
                            <Form.Control
                              type="text"
                              value={editedLanguage}
                              onChange={(e) =>
                                setEditedLanguage(e.target.value)
                              }
                            />
                          </InputGroup>
                          <Button
                            variant="success"
                            size="sm"
                            className="m-2"
                            onClick={() => handleUpdateLanguage(id)}
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="d-flex flex-grow-1 ml-2 cursor-grab">
                            {name}
                          </span>
                          <div className="iconsd">
                            <FaEdit
                              className="edit-icon"
                              onClick={() => handleEditLanguage(id, name)}
                            />
                            <FaTrash
                              className="delete-icon"
                              onClick={() => handleDeleteLanguage(id)}
                            />
                          </div>
                        </>
                      )}
                    </ListGroup.Item>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ListGroup>
          )}
        </Droppable>
      </DragDropContext>

      <InputGroup className="mt-3">
        <Form.Control
          type="text"
          placeholder="Language"
          value={newLanguage}
          onChange={(e) => setNewLanguage(e.target.value)}
        />
      </InputGroup>
      <Button
        onClick={handleAddLanguage}
        className="mt-3 btn btn-outline-light"
      >
        Add More
      </Button>
    </div>
  );
};

export default LanguagesComponent;
