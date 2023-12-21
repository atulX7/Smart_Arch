import React, { useRef, useEffect} from 'react';
import { Stage, Layer, Rect, Arrow } from 'react-konva';
import axios from 'axios';

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

const checkNearbyArrowAndRect = (arrow, rect, threshold, rectName) => {
  const tipInfo = checkNearbyArrowTip(arrow, rect, threshold);
  const startInfo = checkNearbyArrowStart(arrow, rect, threshold);

  if (tipInfo.isNearby && !startInfo.isNearby) {
    return `arrow , ${rectName}`;
  } else if (!tipInfo.isNearby && startInfo.isNearby) {
    return `${rectName} , arrow`;
  }

  return null;
};

const ShapeOverlapAndNearby = () => {
  const rect1Ref = useRef();
  const rect2Ref = useRef();
  const arrowRef = useRef();
  const threshold = 0; // Define the threshold for nearby


  const handleButtonClick = async() => {
    const rect1 = rect1Ref.current.getClientRect();
    const rect2 = rect2Ref.current.getClientRect();
    const arrow = arrowRef.current.getClientRect();

    const resultRect1 = checkNearbyArrowAndRect(arrow, rect1, threshold, 'rect1');
    const resultRect2 = checkNearbyArrowAndRect(arrow, rect2, threshold, 'rect2');

    const newMessages = [];
    if (resultRect1) {
      newMessages.push(resultRect1);
    }
    if (resultRect2) {
      newMessages.push(resultRect2);
    }

      try {
        const response = await axios.post('http://localhost:5000/api/post_data', {
          items: newMessages,
        });
  
        const result = response.data;
        console.log(result);
      } catch (error) {
        console.error('Error posting data:', error);
      }
  };

  useEffect(() => {
    const rect1 = rect1Ref.current;
    const rect2 = rect2Ref.current;
    const arrow = arrowRef.current;

    const handleDragMove = () => {
      const resultRect1 = checkNearbyArrowAndRect(arrow, rect1, threshold, 'rect1');
      const resultRect2 = checkNearbyArrowAndRect(arrow, rect2, threshold, 'rect2');

      const newMessages = [];
      if (resultRect1) {
        newMessages.push(resultRect1);
      }
      if (resultRect2) {
        newMessages.push(resultRect2);
      }
    };

    rect1.on('dragmove', handleDragMove);
    rect2.on('dragmove', handleDragMove);
    arrow.on('dragmove', handleDragMove);

    // Cleanup event listeners on component unmount
    return () => {
      rect1.off('dragmove', handleDragMove);
      rect2.off('dragmove', handleDragMove);
      arrow.off('dragmove', handleDragMove);
    };
  }, [threshold]);

  return (
    <div>
      <button onClick={handleButtonClick}>Submit</button>

      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Rect ref={rect1Ref} x={20} y={20} width={100} height={100} fill="red" draggable />
          <Rect ref={rect2Ref} x={150} y={150} width={100} height={100} fill="blue" draggable />
          <Arrow
            ref={arrowRef}
            points={[250, 50, 300, 50]}
            fill="green"
            stroke="black"
            strokeWidth={2}
            draggable
          />
        </Layer>
      </Stage>
      
    </div>
  );
};

export default ShapeOverlapAndNearby;