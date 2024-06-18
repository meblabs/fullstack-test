import { useState } from 'react';
import { Result } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';

import ContentPanel from '../components/core/layout/ContentPanel';

const Home = () => {
  const [loading] = useState(false);

  return (
    <ContentPanel title="Fullstack Test" loading={loading}>
      <Result
        icon={<FontAwesomeIcon icon={faBook} size="4x" className="text-primary" />}
        title="Expense and Income Diary"
        subTitle="Create an application to track daily expenses and incomes. Users should be able
        to add, read, update, and delete expense and income entries."
      />
    </ContentPanel>
  );
};

export default Home;
