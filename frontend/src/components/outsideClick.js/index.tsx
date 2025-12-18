import { useEffect, useState, useRef } from 'react';

interface DropdownProps {
  value?: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
}

const Dropdown = ({ value, options, placeholder = 'Select', onChange }: DropdownProps): JSX.Element => {
  const node = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const handleClick = (e: MouseEvent) => {
    if (node.current && node.current.contains(e.target as Node)) {
      // inside click
      return;
    }
    // outside click
    setOpen(false);
  };

  const handleChange = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick as EventListener);

    return () => {
      document.removeEventListener('mousedown', handleClick as EventListener);
    };
  }, [open]);

  return (
    <div ref={node} className="dropdown">
      <button className="dropdown-toggler" onClick={() => setOpen(!open)}>
        {value || placeholder}
      </button>
      {open && (
        <ul className="dropdown-menu">
          {options.map((opt, index) => (
            <li key={index} className="dropdown-menu-item" onClick={() => handleChange(opt)}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;

