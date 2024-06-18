/* eslint-disable react/jsx-props-no-spreading */
import { Button, Skeleton, Row, Col, Spin, theme, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

const { useToken } = theme;
const { Title } = Typography;

const ContentPanel = ({
  children,
  title,
  subtitle = false,
  titleAction = false,
  back = false,
  withTabs = false,
  loading = false
}) => {
  const { token } = useToken();

  const titleContainer =
    title || subtitle || titleAction ? (
      <div className="flex w-full items-center">
        {title || subtitle ? (
          <div className="flex-auto">
            {title && <Title className="mb-0 text-lg font-bold lg:text-2xl">{title}</Title>}
            {subtitle && <div className="mt-2">{subtitle}</div>}
          </div>
        ) : (
          ''
        )}
        {titleAction ? <div className="flex-none">{titleAction}</div> : ''}
      </div>
    ) : (
      ''
    );

  const titleBox = (
    <div
      id="title-box"
      className="sticky top-16 z-10 flex flex-row gap-2.5 px-5 py-3"
      style={{ backgroundColor: token.colorBgBase, borderBottom: '1px solid ' + token.colorBorder }}
    >
      {back && (
        <div className="title-back" style={{ borderRight: '1px solid ' + token.colorBorder }}>
          <Button onClick={back} type="link">
            <FontAwesomeIcon icon={faAngleLeft} />
          </Button>
        </div>
      )}
      {loading ? <Skeleton.Input active size="medium" /> : titleContainer}
    </div>
  );

  return (
    <div className="content-panel h-full">
      {title || back || subtitle ? titleBox : ''}
      {withTabs ? (
        <div className="z-1 with-tabs relative">{loading ? <ContentLoading /> : children}</div>
      ) : (
        <div className="z-1 relative p-[var(--gutter)]">{loading ? <ContentLoading /> : children}</div>
      )}
    </div>
  );
};

export default ContentPanel;

export const renderTabBar = (props, DefaultTabBar) => {
  const { token } = useToken();

  let top = 2;
  if (document.querySelector('#title-box')) top += document.querySelector('#title-box').clientHeight;
  if (document.querySelector('#topbar')) top += document.querySelector('#topbar').clientHeight;

  return (
    <div
      className="sticky z-10 mb-5"
      style={{ top: top + 'px', backgroundColor: token.colorBgBase, borderBottom: '1px solid ' + token.colorBorder }}
    >
      <DefaultTabBar {...props} className="mx-5 mb-0" />
    </div>
  );
};

export const ContentLoading = () => (
  <Row type="flex" justify="center" align="middle" className="h-[50vh]">
    <Col>
      <Spin />
    </Col>
  </Row>
);
