import React, { useState } from "react";
import { Stage, Layer, Rect, Circle, Arrow, Transformer, Group } from "react-konva";

const App = () => {
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);

  const addRectangle = () => {
    const newRectangle = {
      type: "rectangle",
      x: 50,
      y: 50,
      width: 100,
      height: 50,
      fill: "blue",
      shadowBlur: 10,
    };

    setShapes([...shapes, newRectangle]);
  };

  const addCircle = () => {
    const newCircle = {
      type: "circle",
      x: 200,
      y: 100,
      radius: 50,
      fill: "red",
    };

    setShapes([...shapes, newCircle]);
  };

  const addArrow = () => {
    const newArrow = {
      type: "arrow",
      points: [300, 200, 400, 50],
      pointerLength: 20,
      pointerWidth: 20,
      stroke: "green",
      strokeWidth: 10,
    };

    setShapes([...shapes, newArrow]);
  };

  const handleSelect = (e) => {
    setSelectedShape(e.target);
  };

  const handleStageClick = (e) => {
    // Check if the click was on a shape or outside
    if (e.target === e.target.getStage()) {
      setSelectedShape(null);
    }
  };

  const handleTransform = () => {
    // Update the state with the modified shapes
    setShapes((prevShapes) => {
      return prevShapes.map((shape) => {
        if (shape.id === selectedShape.id) {
          return {
            ...shape,
            ...selectedShape.attrs,
          };
        }
        return shape;
      });
    });
  };


  return (
    <div>
      <button onClick={addRectangle}>Add Rectangle</button>
      <button onClick={addCircle}>Add Circle</button>
      <button onClick={addArrow}>Add Arrow</button>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={handleStageClick}
      >
        <Layer>
          {shapes.map((shape, index) => {
            return (
              <Group
                key={index}
                draggable
                onClick={handleSelect}
                onTransformEnd={handleTransform}
              >
                {shape.type === "rectangle" && <Rect {...shape} />}
                {shape.type === "circle" && <Circle {...shape} />}
                {shape.type === "arrow" && <Arrow {...shape} />}
              </Group>
            );
          })}
          {selectedShape && (
            <Transformer
              ref={(node) => {
                // Make the Transformer focus on the selected shape
                if (node && selectedShape) {
                  node.nodes([selectedShape]);
                }
              }}
              keepRatio={false}
              onTransform={handleTransform}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
