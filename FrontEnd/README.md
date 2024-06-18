# Fullstack Test Api

The frontend folder for fullstack test as Single Page Application in [React](https://it.reactjs.org/) and [AntDesign](https://ant.design/).

Accessible at [http://localhost](http://localhost) when Docker is running.

## Requirements

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## Prepare Project

```sh
npm ci
```

---

# Optional Features and Helpers

## Menu

- [Form and SubmitButton](#form-and-submitbutton)
- [Content Panel](#content-panel)
- [Table](#table)
- [Procedural Form](#procedural-form)
  - [Available fields type](#available-fields-type)
  - [Text](#text)
  - [Select](#select)
  - [Boolean](#boolean)
  - [Date](#date)
  - [Comment](#comment)
  - [Add more fields](#add-more-fields)
- [Filters with the Table](#filters-with-the-table)
- [Filters without the Table](#filters-without-the-table)
- [Hooks](#hooks)
  - [useLocalStorage](#uselocalstorage)
  - [useOnResize](#useonresize)
  - [useSessionStorage](#usesessionstorage)
  - [useKeyPress](#usekeypress)
  - [useFullscreenStatus](#usefullscreenstatus)

## Form and SubmitButton

```jsx
import { useContext, useEffect, useState, useRef } from 'react';
import { Form } from 'antd';

import WrapperForm from '../components/controls/WrapperForm';
import SubmitButton from '../components/controls/SubmitButton';

const Example = () => {
  const submitButtonRef = useRef(null);
  const [form] = Form.useForm();

  const handleSubmit = data => {
    const request = { ...data };
    /* do your staff... */

    return Api.patch(`/example/${id}`, request)
      .then(() => {
        /* do your staff... */
      })
      .catch(err => {
        /* catch error and important: throw at the end!... */
        throw err;
      });
  };

  return (
    <WrapperForm form={form} onSubmit={handleSubmit} submitBtn={submitButtonRef}>
      {/* 
      ...
      */}
      <SubmitButton ref={submitButtonRef} type="primary">
        {t('common.save')}
      </SubmitButton>
    </WrapperForm>
  );
};

export default Example;
```

## Content Panel

The ContentPanel component is a versatile React component that provides a flexible and customizable container for content display. It allows you to create content panels with titles, subtitles, back buttons, and tabs, making it suitable for various UI layouts and scenarios.

#### Usage

To use the ContentPanel component, follow these steps:

```javascript
import { Button, Skeleton, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

const { Title } = Typography;

const MyComponent = () => {
  return (
    <ContentPanel
      title="My Content Panel"
      subtitle="Subtitle for the content"
      titleAction={<Button type="primary">Action</Button>}
      back={() => console.log('Back button clicked')}
      withTabs={false}
      loading={false}
    >
      {/* Your content goes here */}
    </ContentPanel>
  );
};
```

#### Props

The ContentPanel component accepts the following props:

- children: The content that will be displayed within the content panel. This can be any valid JSX content.

- title: The main title for the content panel. It is displayed at the top of the panel.

- subtitle: An optional subtitle for the content panel. It is displayed below the main title.

- titleAction: An optional JSX element representing an action associated with the title. It is displayed on the right side of the title.

- back: An optional function that will be called when the back button is clicked. When set, a back button will be displayed on the left side of the title.

- withTabs: A boolean prop that determines whether the content panel should display content with tabs. When set to true, the content is displayed with tabs.

- loading: A boolean prop that indicates whether the content panel is in a loading state. When set to true, a loading spinner will be displayed instead of the content.

#### Additional Components

The ContentPanel component also provides two additional components:

- renderTabBar: This component is used to customize the appearance of the tabs when withTabs is set to true. It receives two props: props and DefaultTabBar. You can use this component to create a custom tab bar for the content panel.

- ContentLoading: This component provides a default loading spinner that can be used when the loading prop is set to true. It displays a centered loading spinner using Ant Design's Spin component.

#### Notes

- The ContentPanel component is designed to provide a consistent and reusable layout for content display. It allows for easy customization by using props to control the appearance and behavior of the panel.

- The component uses Ant Design components such as Button, Skeleton, Row, Col, Spin, and Typography to create the layout and display elements.

- The renderTabBar component can be used to create a custom tab bar for the content panel when withTabs is set to true. It leverages the DefaultTabBar component from Ant Design to ensure compatibility with the existing tab functionality.

- The ContentLoading component provides a simple loading spinner that can be used when the loading prop is set to true. It displays the spinner centered on the screen using the Row and Col components from Ant Design.

## Table

The Table component is a customizable data table implementation in React. It leverages the Ant Design library to provide various features such as sorting, filtering, pagination, and actions like editing and deleting records. This component aims to streamline the process of rendering and managing data tables within a React application.

#### Usage

To use the Table component, follow these steps:

```javascript
import { useContext, useEffect, useState } from 'react';
import { Table as AntTable, Popconfirm, Button, Input, Form, theme, Tooltip, Modal, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faSearch, faAdd, faFilter } from '@fortawesome/free-solid-svg-icons';
import InfiniteScroll from 'react-infinite-scroll-component';

import { classNames } from '../../../helpers/core/utils';
import Filters from './Filters';
import TableCount from '../extra/TableCount';
import MessageContext from '../../../helpers/core/MessageContext';

import '../../../styles/core/components/Table.css';

const { useToken } = theme;

const Table = ({
  // Props
  form = false,
  dataSource = [],
  infinite = false,
  leftActions,
  rightActions,
  className,
  addForm,
  setupAddForm,
  onEscape = () => {},
  onEnter = () => {},
  deleteSaveButtonOnRow = false,
  editCancelButtonOnRow = false,
  onDelete = () => {},
  onEdit = () => {},
  isRecordEditing = () => false,
  columns: initColumns,
  searchBar = false,
  onChangeSearchBar = () => {},
  sortableKeys = [],
  pagination = false,
  compact = false,
  showCount = true,
  totalCount,
  countLabel = null,
  countContext = 'male',
  handleSaveMessage = true,
  filters,
  ...props
}) => {
  // Component logic and rendering
};

export default Table;
```

#### Props

The Table component accepts the following props:

- form: A boolean prop that indicates whether the component should be wrapped in an Ant Design Form. When set to true, the component will be wrapped in a Form component, and you can use form from Ant Design to interact with the form fields.

- dataSource: An array of data objects that represent the rows of the table. Each object represents a single row, and each property of the object corresponds to a column in the table.

- infinite: A boolean prop that enables infinite scrolling for the table. When set to true, the table will render an InfiniteScroll component from the react-infinite-scroll-component library, which allows for better performance with large datasets.

- leftActions: JSX elements to be rendered on the left side of the table header.

- rightActions: JSX elements to be rendered on the right side of the table header.

- className: A string prop that allows you to add custom CSS classes to the table container for styling.

- addForm: An object that represents the configuration for a modal form used for adding new records to the table. It includes properties like title, template, onSave, and onCancel.

- setupAddForm: A function that sets up the add form configuration. It can be used to render a custom modal for adding new records.

- onEscape: A function that will be called when the "Escape" key is pressed. It can be used for custom keyboard navigation or other actions.

- onEnter: A function that will be called when the "Enter" key is pressed. It can be used for custom keyboard navigation or other actions.

- deleteSaveButtonOnRow: A boolean prop that enables the display of delete buttons for each row. When set to true, a "Delete" button will appear next to each row.

- editCancelButtonOnRow: A boolean prop that enables the display of edit buttons for each row. When set to true, an "Edit" button will appear next to each row.

- onDelete: A function that will be called when a row is deleted. It receives the corresponding record as an argument.

- onEdit: A function that will be called when a row is edited. It receives the corresponding record as an argument.

- isRecordEditing: A function that determines whether a record is currently being edited. It can be used to manage the editing state of a row.

- columns: An array of objects representing the columns of the table. Each object should have properties like dataIndex, title, and render, among others.

- searchBar: A boolean prop that enables the display of a search bar above the table. When set to true, a search input field will appear.

- onChangeSearchBar: A function that will be called when the search input value changes. It receives the event object as an argument.

- sortableKeys: An array of strings representing the column keys that are sortable. When a column key is included in this array, the table will enable sorting for that column.

- pagination: A boolean prop that enables the display of pagination for the table. When set to true, the table will display pagination controls.

- compact: A boolean prop that enables a compact mode for the table, hiding some elements like the header.

- showCount: A boolean prop that determines whether the table should display the total count of records. When set to true, the total count will be displayed.

- totalCount: The total count of records in the table. This prop can be used to override the default count derived from the dataSource.

- countLabel: A custom label to display along with the total count. It can be used to provide context for the count.

- countContext: A string indicating the context of the count label. It can be used to adapt the count label to different contexts (e.g., male, female, or neutral).

- handleSaveMessage: A boolean prop that controls whether success and error messages are displayed when saving records.

- filters: An object that represents the configuration for table filters. It includes properties like layout, onCloseDrawer, onClearFilters, showFilter, and hasFilters.

- ...props: Additional props that can be passed to the underlying AntTable component.

#### Notes

- The Table component relies on Ant Design components and other libraries like react-infinite-scroll-component to provide advanced features and customization options.

- The component uses the AntTable component from Ant Design to render the table. It extends this component by adding custom actions, buttons, and other features based on the provided props.

- When using the form prop, the component can interact with form fields through the form object from Ant Design.

- The dataSource prop should be an array of data objects, and each object should represent a single row in the table.

- The columns prop defines the columns of the table. Each object in the columns array represents a column, and the object's properties define the column's behavior and appearance.

- The onDelete and onEdit props can be used to handle delete and edit actions for individual rows in the table.

- The infinite prop allows you to enable infinite scrolling for better performance with large datasets.

- The filters prop enables table filtering and provides configuration for filter options.

- The showCount prop displays the total count of records in the table, which can be overridden using the totalCount prop.

## Country Select

The CountrySelect component is a custom React component that provides a country select dropdown using the Ant Design Select component. It allows users to choose a country from a list of options and displays the selected country's flag along with its name in the dropdown.

#### Usage

To use the CountrySelect component, follow these steps:

```javascript
const MyComponent = () => {
  const handleChange = value => {
    console.log('Selected country:', value);
    // Add your logic here to handle the selected country value
  };

  return (
    <CountrySelect value="" onChange={handleChange} className="custom-country-select" limit={['US', 'CA', 'GB']} />
  );
};
```

Or inside Ant Form

```javascript
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { FlagIcon } from 'react-flag-kit';

const MyComponent = () => {
  const [form] = useForm();

  const onFinish = values => {
    console.log('Form values:', values);
    // Add your logic here to handle form submission
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="country" label="Country" rules={[{ required: true, message: 'Field required' }]}>
        <CountrySelect limit={['US', 'CA', 'GB']} />
      </Form.Item>
    </Form>
  );
};
```

Props
The CountrySelect component accepts the following props:

value: The currently selected value of the select dropdown. It is a string representing the selected country code (e.g., "US" for the United States).

onChange: A function that will be called when the user selects a country from the dropdown. It receives the selected value as an argument.

className: A string representing the custom CSS class to be applied to the select dropdown.

limit: An optional array of country codes (in uppercase) that limits the displayed countries in the dropdown to the specified list. If provided, only the countries with codes present in this array will be shown.

Functionality
The CountrySelect component provides the following functionality:

It uses the useTranslation hook from react-i18next to determine the current language used in the application.

The component registers English (en) and Italian (it) locales from the i18n-iso-countries package to get the country names based on the current language.

It generates a list of country options for the Select dropdown based on the registered locales and the limit prop.

The options are sorted alphabetically by the country names.

It provides a search functionality in the dropdown using the showSearch, optionFilterProp, and filterOption props of the Select component to allow users to search for specific countries.

Each option in the dropdown includes the country's flag icon provided by the FlagIcon component from the react-flag-kit package along with the country's name.

Notes
The CountrySelect component enhances the user experience by providing an intuitive and visually appealing country select dropdown with flag icons.

The component uses the Select component from Ant Design to render the select dropdown and leverages the FlagIcon component to display the flag icons.

It uses the i18n-iso-countries package to get the official names of countries based on the selected language.

The limit prop allows you to control the countries displayed in the dropdown, which can be useful if you want to show a specific set of countries.

## Procedural Form

It is possible to automatically generate a form from an object. This is useful for generating dynamic forms. First, we need to define the object.

```js
import i18next from 'i18next';

const testData = () => ({
  title: i18next.t('form.title'),
  description: i18next.t('form.desc'),
  pages: [
    {
      name: 'page1',
      elements: [
        { type: '', name: '' /*...*/ },
        { type: '', name: '' /*...*/ },
        { type: '', name: '' /*...*/ }
      ]
    }
  ]
});

export { testData };
```

Note that `testData` must be a function to ensure that translations are updated. `Pages` is an array of pages, while `elements` contains the individual form elements (ProceduralFormItem). Later on, the supported field types and their syntax are listed.

```jsx
import testData from '../path/to/TestFormData';
import { Form } from 'antd';
import ProceduralForm from '../components/core/controls/ProceduralForm';

const [form] = Form.useForm();

const fetchData = () =>
  Api.get(`whatever`).then(res => {
    /* do your staff... */
    return res.data;
  });

const saveForm = data =>
  Api.post(`whatever`, data).then(res => {
    /* do your staff... */
    return res.data;
  });

<ProceduralForm json={testData} fetchData={fetchData} onFinish={saveForm} form={form} />;
```

### Available fields type

All fields support the following properties:

```js
{
    name: 'fieldName',
    type: 'fieldType',
    isRequired: bool,
    size: 'null|half|third',
    visibleIf: '{nameOfAnotherField} = valueOfAnotherField',
}
```

### Text

A simple text input

```js
{
    name: 'fieldName',
    type: 'text'
}
```

### Select

Select input with options

```js
{
    name: 'fieldName',
    type: 'select',
    choices: [
        { value: 1, text: 'Yes' },
        { value: 0, text: 'No' },
    ]
}
```

### Boolean

A radio button with true/false values

```js
{
  type: 'boolean',
  name: 'exampleBoolean',
  type: 'boolean'
}
```

### Date

A date picker

```js
{
  type: 'date',
  name: 'exampleDate',
}
```

### Comment

A simple textarea field

```js
 {
  type: 'comment',
  name: 'exampleComment',

}
```

### Add more fields

To add new field types, simply include them in the switch statement of `ProceduralFormItem`. In the case of components different from the native AntDesign components, they will be treated according to the [custom fields rules of Ant](https://ant.design/components/form#components-form-demo-customized-form-controls). Make sure to create the correct entry in the generation JSON as well.

## Filters with the Table

1. Import the necessary components

```js
import Table from '../components/layout/Table';
import { useFilters } from '../components/controls/Filters';
import { Form } from 'antd';
```

2.  Initialize the states. During filter initialization, it is necessary to define the namespace used to save the values in localStorage.

```js
const [form] = Form.useForm();
const handleFilters = useFilter('nameSpace');
```

3. Define an effect to handle the modification of saved values and hydrate the filter form.

```js
useEffect(() => {
  // initDataFunction()
}, [handleFilters.savedFilters]);

useEffect(() => {
  form.setFieldsValue(handleFilters.savedFilters);
  // initDataFunction()
}, [deps]);
```

4. Define the layout of the filters. We will use AntDesign's onChange to update the filters on every change.

```jsx
const filters = (
  <Form form={form}>
    <Form.Item>
      <Select onChange={val => handleFilters.saveFilters('filterfiledName', val)}>...</Select>
    </Form.Item>
    ...
  </Form>
);
```

5. Initialize the Table

```jsx
<Table
  // ...
  filters={{
    ...handleFilters,
    form,
    layout: filters
    // topGap: custom top if needed
  }}
/>
```

## Filters without the Table

1. Import the necessary components

```js
import Filters, { useFilters } from '../components/controls/Filters';
import { Form, Tooltip, Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
```

2.  Initialize the states. During filter initialization, it is necessary to define the namespace used to save the values in localStorage.

```js
const [form] = Form.useForm();
const handleFilters = useFilter('nameSpace');
```

3. Define an effect to handle the modification of saved values and hydrate the filter form.

```js
useEffect(() => {
  // initDataFunction()
}, [handleFilters.savedFilters]);

useEffect(() => {
  form.setFieldsValue(handleFilters.savedFilters);
  // initDataFunction()
}, [deps]);
```

4. Define the button to open the filters.

```jsx
<Tooltip title={t('common.filter')}>
  <Button
    className={classNames(handleFilters.filterIconClass, handleFilters.showFilter && 'filter-btn-open')}
    type="primary"
    shape="circle"
    icon={<FontAwesomeIcon icon={faFilter} />}
    onClick={() => handleFilters.toggleFilter()}
  />
</Tooltip>
```

5. Define the layout of the filters. We will use AntDesign's onChange to update the filters on every change.

```jsx
const filters = (
  <Form form={form}>
    <Form.Item>
      <Select onChange={val => handleFilters.saveFilters('filterfiledName', val)}>...</Select>
    </Form.Item>
    ...
  </Form>
);
```

6. Render the filters.

```jsx
<div className={handleFilters.filterContainerClasses}>
  <Filters
    onClose={handleFilters.onCloseDrawer}
    onClear={() => handleFilters.onClearFilters(form)}
    showFilter={handleFilters.showFilter}
    filters={filters}
    // topGap: custom top if needed
  />
  ...
</div>
```
