import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { router } from './router';
import { queryClient } from './api/query-client';
import './App.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={viVN}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
