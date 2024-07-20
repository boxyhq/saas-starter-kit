/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';
import { Button, Form, ListGroup, InputGroup } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const FrameworksComponent = () => {
  const [frameworks, setFrameworks] = useState([
    { id: '1', name: 'React', level: 90 },
    { id: '2', name: 'Angular', level: 70 },
    { id: '3', name: 'Vue', level: 75 },
  ]);
  const [newFramework, setNewFramework] = useState('');
  const [newLevel, setNewLevel] = useState(0);

  const handleAddFramework = () => {
    if (newFramework && newLevel > 0) {
      setFrameworks([
        ...frameworks,
        { id: `${frameworks.length + 1}`, name: newFramework, level: newLevel },
      ]);
      setNewFramework('');
      setNewLevel(0);
    }
  };

  const handleDeleteFramework = (id) => {
    setFrameworks(frameworks.filter((framework) => framework.id !== id));
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedFrameworks = Array.from(frameworks);
    const [movedFramework] = reorderedFrameworks.splice(result.source.index, 1);
    reorderedFrameworks.splice(result.destination.index, 0, movedFramework);

    setFrameworks(reorderedFrameworks);
  };

  return (
    <div>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="frameworks">
          {(provided) => (
            <ListGroup {...provided.droppableProps} ref={provided.innerRef}>
              {frameworks.map(({ id, name, level }, index) => (
                <Draggable key={id} draggableId={id} index={index}>
                  {(provided) => (
                    <ListGroup.Item
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span className="d-flex flex-grow-1 ml-2 cursor-grab">
                        {name}
                      </span>
                      <span className="mx-2">{level}</span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteFramework(id)}
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
          placeholder="Framework"
          value={newFramework}
          onChange={(e) => setNewFramework(e.target.value)}
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
      <Button onClick={handleAddFramework} className="mt-3">
        Add
      </Button>
    </div>
  );
};

export default FrameworksComponent;
