import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Arrow, Image, Transformer } from "react-konva";

const checkNearbyArrowTip = (arrow, rect, threshold) => {
  if (!arrow || !rect) {
    return { isNearby: false, side: null };
  }

  // Extract the tip of the arrow (last two points)
  const arrowTip = { x: arrow.x + arrow.width, y: arrow.y + arrow.height };

  // Check if the tip of the arrow is near any side of the rectangle
  const isLeftOfRect = arrowTip.x + threshold >= rect.x;
  const isRightOfRect = arrowTip.x <= rect.x + rect.width + threshold;
  const isAboveRect = arrowTip.y + threshold >= rect.y;
  const isBelowRect = arrowTip.y <= rect.y + rect.height + threshold;

  return {
    isNearby: isLeftOfRect && isRightOfRect && isAboveRect && isBelowRect,
    side: {
      left: isLeftOfRect,
      right: isRightOfRect,
      top: isAboveRect,
      bottom: isBelowRect,
    },
    arrowTip,
  };
};

const checkNearbyArrowStart = (arrow, rect, threshold) => {
  if (!arrow || !rect) {
    return { isNearby: false, side: null };
  }

  // Extract the starting point of the arrow (first two points)
  const arrowStart = { x: arrow.x, y: arrow.y };

  // Check if the starting point of the arrow is near any side of the rectangle
  const isLeftOfRect = arrowStart.x + threshold >= rect.x;
  const isRightOfRect = arrowStart.x <= rect.x + rect.width + threshold;
  const isAboveRect = arrowStart.y + threshold >= rect.y;
  const isBelowRect = arrowStart.y <= rect.y + rect.height + threshold;

  return {
    isNearby: isLeftOfRect && isRightOfRect && isAboveRect && isBelowRect,
    side: {
      left: isLeftOfRect,
      right: isRightOfRect,
      top: isAboveRect,
      bottom: isBelowRect,
    },
    arrowStart,
  };
};

const checkNearbyArrowAndShape = (arrow, shape, threshold) => {
  const arrowClientRect = arrow.getClientRect();
  const shapeClientRect = shape.getClientRect();

  const tipInfo = checkNearbyArrowTip(
    arrowClientRect,
    shapeClientRect,
    threshold
  );
  const startInfo = checkNearbyArrowStart(
    arrowClientRect,
    shapeClientRect,
    threshold
  );

  if (tipInfo.isNearby && !startInfo.isNearby) {
    return `${arrow.attrs.id}, ${shape.attrs.id}`;
  } else if (!tipInfo.isNearby && startInfo.isNearby) {
    return `${shape.attrs.id}, ${arrow.attrs.id}`;
  }

  return null;
};

const ShapeOverlapAndNearby = () => {
  const [rectangles, setRectangles] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [transformer, setTransformer] = useState(null);
  const [messages, setMessages] = useState([]);
  const threshold = 0;
  const stageRef = useRef();

  const addRectangle = () => {
    const newRect = {
      x: Math.random() * window.innerWidth * 0.5,
      y: Math.random() * window.innerHeight * 0.5,
      width: 100,
      height: 100,
      fill: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      id: `rect${rectangles.length}`,
    };
    setRectangles([...rectangles, newRect]);
  };

  const addArrow = () => {
    const newArrow = {
      points: [250, 50, 300, 50],
      fill: "green",
      stroke: "black",
      strokeWidth: 2,
      id: `arrow${arrows.length}`,
    };
    setArrows([...arrows, newArrow]);
  };

  const addImage = () => {
    const image = new window.Image();
    image.src = "../assets/img1.png"; // Replace with the actual path to your image
  
    image.onload = () => {
      const newImage = {
        x: Math.random() * window.innerWidth * 0.5,
        y: Math.random() * window.innerHeight * 0.5,
        width: 100,
        height: 100,
        image: image,
        id: `img${images.length}`,
      };
      setImages([...images, newImage]);
    };
  };
  

  const handleSubmit = () => {
    console.log(messages);
  };

  const handleDoubleClick = (shape) => {
    setSelectedShape(shape);
    const layer = stageRef.current.getStage().findOne("Layer");
    const tr = new Transformer();
    layer.add(tr);
    tr.attachTo(shape);
    setTransformer(tr);
  };

  const handleStageClick = () => {
    setSelectedShape(null);
    setTransformer(null);
  };

  useEffect(() => {
    const handleDragMove = () => {
      const newMessages = [];
      const layer = stageRef.current.getStage().findOne("Layer");

      arrows.forEach((arrowData) => {
        rectangles.forEach((rectData) => {
          const arrowNode = layer.findOne(`#${arrowData.id}`);
          const rectNode = layer.findOne(`#${rectData.id}`);
          const result = checkNearbyArrowAndShape(
            arrowNode,
            rectNode,
            threshold
          );
          if (result) {
            newMessages.push(result);
          }
        });
      });
      arrows.forEach((arrowData) => {
        images.forEach((imageData) => {
          const arrowNode = layer.findOne(`#${arrowData.id}`);
          const imageNode = layer.findOne(`#${imageData.id}`);
          const result = checkNearbyArrowAndShape(
            arrowNode,
            imageNode,
            threshold
          );
          if (result) {
            newMessages.push(result);
          }
        });
      });

      setMessages(newMessages);
    };

    const stage = stageRef.current;

    stage.on("dragmove", handleDragMove);

    return () => {
      stage.off("dragmove", handleDragMove);
    };
  }, [rectangles, arrows, images, threshold]);

  return (
    <div>
      <button onClick={addRectangle}>Add Rectangle</button>
      <button onClick={addArrow}>Add Arrow</button>
      <button onClick={addImage}>Add Image</button>
      <button onClick={handleSubmit}>Submit</button>

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={handleStageClick}
      >
        <Layer>
          {rectangles.map((rect) => (
            <React.Fragment key={rect.id}>
              <Rect
                {...rect}
                draggable
                onDblClick={() => handleDoubleClick(rect)}
              />
              {selectedShape && selectedShape.id === rect.id && transformer && (
                <Transformer
                  ref={setTransformer}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Limiting the minimum size of the rectangle
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              )}
            </React.Fragment>
          ))}
          {arrows.map((arrow) => (
            <Arrow key={arrow.id} {...arrow} draggable />
          ))}
          {images.map((image) => (
            <React.Fragment key={image.id}>
              <Image
                {...image}
                draggable
                onDblClick={() => handleDoubleClick(image)}
              />
              {selectedShape && selectedShape.id === image.id && transformer && (
                <Transformer
                  ref={setTransformer}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Limiting the minimum size of the image
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default ShapeOverlapAndNearby;