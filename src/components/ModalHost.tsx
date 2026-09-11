/* 弹窗宿主：渲染当前 modal 配置；点击遮罩外不关闭（强制走取消按钮） */
import React from 'react';
import { useLims } from '../context/LimsContext';

export const ModalHost: React.FC = () => {
  const { modal, closeModal } = useLims();
  if (!modal) return null;
  return (
    <div className="modal-mask" style={{ display: 'flex' }}>
      <div className={'modal' + (modal.wide ? ' wide' : '')}>
        <div className="modal-h">
          <span>{modal.title}</span>
          <span className="modal-x" onClick={closeModal}>✕</span>
        </div>
        <div className="modal-b">{modal.body}</div>
      </div>
    </div>
  );
};
