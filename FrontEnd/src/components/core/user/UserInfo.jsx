import { Avatar, Typography } from 'antd';
import { classNames } from '../../../helpers/core/utils';

// import CompanyPic from './CompanyPic';
import UserPic from './UserPic';

const { Text } = Typography;

const UserInfo = ({ user, className, noText = false, link = true, left = false }) =>
  user ? (
    <span className={classNames(left ? 'flex-row-reverse' : '', 'flex items-center gap-x-2', className)}>
      {!noText && (
        <span className={(left ? 'text-left' : 'text-right') + ' flex flex-1 flex-col'}>
          <Text className="m-0 truncate text-sm font-normal leading-none">{user.fullname}</Text>
          <Text className="m-0 truncate text-sm font-normal leading-none" type="secondary">
            {user.company.name}
          </Text>
        </span>
      )}
      <Avatar.Group>
        <UserPic user={user} link={link} />
        {/* <CompanyPic company={user.company} link={link} loadPic /> */}
      </Avatar.Group>
    </span>
  ) : null;

export default UserInfo;
