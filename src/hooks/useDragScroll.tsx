import { useRef, useEffect } from 'react';

export const useDragScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);
  const scale = useRef(1);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const editor = element.querySelector('.editor') as HTMLDivElement;
    if (!editor) return;
    editor.style.transform = `scale(${scale.current})`;

    // Centralizar o scroll inicialmente
    const centerX = (editor.offsetWidth - element.clientWidth) / 2;
    const centerY = (editor.offsetHeight - element.clientHeight) / 2;
    element.scrollLeft = centerX;
    element.scrollTop = centerY;

    const handleMouseDown = (e: MouseEvent) => {
      // Ignorar se clicar em um círculo de conexão
      const target = e.target as HTMLElement;
      if (target.classList.contains('connection-port')) {
        return;
      }
      
      isDown.current = true;
      element.classList.add('active');
      startX.current = e.pageX - element.offsetLeft;
      startY.current = e.pageY - element.offsetTop;
      scrollLeft.current = element.scrollLeft;
      scrollTop.current = element.scrollTop;
    };

    const handleMouseLeave = () => {
      isDown.current = false;
      element.classList.remove('active');
    };

    const handleMouseUp = () => {
      isDown.current = false;
      element.classList.remove('active');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown.current) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const y = e.pageY - element.offsetTop;
      const walkX = (x - startX.current);
      const walkY = (y - startY.current);
      element.scrollLeft = scrollLeft.current - walkX;
      element.scrollTop = scrollTop.current - walkY;
    };

    const handleWheel = (e: WheelEvent) => {
      // Ctrl + Wheel ou Cmd + Wheel para zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(Math.max(0.1, scale.current + delta), 3); // Min: 10%, Max: 300%
        
        // Calcular posição do mouse relativa ao editor
        const rect = element.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calcular scroll offset para manter o zoom centralizado no mouse
        const scrollX = element.scrollLeft;
        const scrollY = element.scrollTop;
        
        const scaleRatio = newScale / scale.current;
        
        // Ajustar scroll para manter a posição do mouse
        element.scrollLeft = scrollX * scaleRatio + (mouseX * (scaleRatio - 1));
        element.scrollTop = scrollY * scaleRatio + (mouseY * (scaleRatio - 1));
        
        scale.current = newScale;
        editor.style.transform = `scale(${newScale})`;
        editor.style.transformOrigin = '0 0';
      }
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return ref;
};