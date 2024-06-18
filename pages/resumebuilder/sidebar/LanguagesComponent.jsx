import React, { useState } from "react";
import {
  Button,
  Form,
  ListGroup,
  InputGroup,
} from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const LanguagesComponent = () => {
  const [languages, setLanguages] = useState([
    { id: "1", name: "JavaScript", level: 90 },
    { id: "2", name: "HTML5", level: 80 },
    { id: "3", name: "CSS", level: 80 },
  ]);
  const [newLanguage, setNewLanguage] = useState("");
  const [newLevel, setNewLevel] = useState(0);

  const handleAddLanguage = () => {
    if (newLanguage && newLevel > 0) {
      setLanguages([
        ...languages,
        { id: `${languages.length + 1}`, name: newLanguage, level: newLevel },
      ]);
      setNewLanguage("");
      setNewLevel(0);
    }
  };

  const handleDeleteLanguage = (id) => {
    setLanguages(languages.filter((language) => language.id !== id));
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedLanguages = Array.from(languages);
    const [movedLanguage] = reorderedLanguages.splice(result.source.index, 1);
    reorderedLanguages.splice(result.destination.index, 0, movedLanguage);

    setLanguages(reorderedLanguages);
  };

  return (
    <div>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="languages">
          {(provided) => (
            <ListGroup {...provided.droppableProps} ref={provided.innerRef}>
              {languages.map(({ id, name, level }, index) => (
                <Draggable key={id} draggableId={id} index={index}>
                  {(provided) => (
                    <ListGroup.Item
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span className="d-flex flex-grow-1 ml-2 cursor-grab">{name}</span>
                      <span className="mx-2">{level}</span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteLanguage(id)}
                      >
                        X
                      </Button>
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
      <InputGroup className="mt-3">
        <Form.Range
          min={0}
          max={100}
          value={newLevel}
          onChange={(e) => setNewLevel(Number(e.target.value))}
        />
        <Form.Control
          type="number"
          placeholder="Level"
          value={newLevel}
          onChange={(e) => setNewLevel(Number(e.target.value))}
        />
      </InputGroup>
      <Button onClick={handleAddLanguage} className="mt-3 btn btn-outline-light">
        Add More
      </Button>
    </div>
  );
};

export default LanguagesComponent;
