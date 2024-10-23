import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  min: number;
  max: number;
  step?: number;
  value: number[];
  onValueChange: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min, max, step = 1, value, onValueChange, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(value);
    const [isDragging, setIsDragging] = React.useState<number | null>(null);
    const sliderRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(index);
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging !== null && sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        let newValue = Math.round((percentage * (max - min) + min) / step) * step;
        newValue = Math.max(min, Math.min(max, newValue));

        const updatedValue = [...localValue];
        updatedValue[isDragging] = newValue;

        if (isDragging === 0 && newValue > updatedValue[1]) {
          updatedValue[1] = newValue;
        } else if (isDragging === 1 && newValue < updatedValue[0]) {
          updatedValue[0] = newValue;
        }

        setLocalValue(updatedValue);
        onValueChange(updatedValue);
      }
    };

    React.useEffect(() => {
      if (isDragging !== null) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging]);

    const percentage1 = ((localValue[0] - min) / (max - min)) * 100;
    const percentage2 = ((localValue[1] - min) / (max - min)) * 100;

    return (
      <div className={cn("relative w-full h-4", className)} ref={sliderRef}>
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full transform -translate-y-1/2" />
        <div
          className="absolute top-1/2 h-1 bg-indigo-500 rounded-full transform -translate-y-1/2"
          style={{ left: `${percentage1}%`, right: `${100 - percentage2}%` }}
        />
        <div
          className="absolute top-1/2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{ left: `${percentage1}%` }}
          onMouseDown={handleMouseDown(0)}
        />
        <div
          className="absolute top-1/2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{ left: `${percentage2}%` }}
          onMouseDown={handleMouseDown(1)}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
