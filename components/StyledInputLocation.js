import React from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';

import { formatFormErrorMessage } from '../lib/form-utils';

import I18nAddressFields, { SimpleLocationFieldRenderer } from './I18nAddressFields';
import InputTypeCountry from './InputTypeCountry';
import StyledInputField from './StyledInputField';
import StyledTextarea from './StyledTextarea';

const DEFAULT_LOCATION = {
  country: null,
  address: null,
  structured: null,
};

/**
 * A component to input a location. It tries to use the structured address if available,
 * and fallbacks on the raw address if not.
 */
const StyledInputLocation = ({
  name,
  location,
  autoDetectCountry,
  labelFontSize,
  labelFontWeight,
  onChange,
  errors,
  prefix,
  required,
}) => {
  const [useFallback, setUseFallback] = React.useState(false);
  const intl = useIntl();
  const forceLegacyFormat = Boolean(!location?.structured && location?.address);
  const hasCountry = Boolean(location?.country);
  return (
    <div>
      <StyledInputField
        name={`${prefix}country`}
        htmlFor={`${prefix}country`}
        label={<FormattedMessage id="ExpenseForm.ChooseCountry" defaultMessage="Choose country" />}
        labelFontSize={labelFontSize}
        labelFontWeight={labelFontWeight}
        error={formatFormErrorMessage(intl, errors?.country)}
        required={required}
      >
        {({ id, ...inputProps }) => (
          <InputTypeCountry
            {...inputProps}
            inputId={id}
            value={location?.country}
            autoDetect={autoDetectCountry}
            onChange={country => {
              onChange({ ...(location || DEFAULT_LOCATION), country });
              if (setUseFallback) {
                setUseFallback(false);
              }
            }}
          />
        )}
      </StyledInputField>
      {hasCountry && !useFallback && !forceLegacyFormat ? (
        <I18nAddressFields
          selectedCountry={location.country}
          value={location.structured || {}}
          onLoadError={() => setUseFallback(true)} // TODO convert from structured to raw
          Component={SimpleLocationFieldRenderer}
          fieldProps={{ labelFontSize, labelFontWeight }}
          required={required}
          onCountryChange={structured =>
            onChange(
              pick({ ...(location || DEFAULT_LOCATION), structured }, ['name', 'address', 'country', 'structured']),
            )
          }
        />
      ) : (
        <StyledInputField
          name={`${prefix}${name}`}
          label={intl.formatMessage({ id: 'collective.address.label', defaultMessage: 'Address' })}
          required
          mt={3}
          labelFontSize={labelFontSize}
          labelFontWeight={labelFontWeight}
        >
          {inputProps => (
            <StyledTextarea
              {...inputProps}
              disabled={!hasCountry}
              data-cy={`${prefix}address`}
              minHeight={100}
              placeholder="P. Sherman 42&#10;Wallaby Way&#10;Sydney"
              defaultValue={location?.address || ''}
              onChange={e => onChange({ ...(location || DEFAULT_LOCATION), address: e.target.value })}
            />
          )}
        </StyledInputField>
      )}
    </div>
  );
};

StyledInputLocation.propTypes = {
  name: PropTypes.string,
  prefix: PropTypes.string,
  onChange: PropTypes.func,
  autoDetectCountry: PropTypes.bool,
  required: PropTypes.bool,
  labelFontWeight: PropTypes.any,
  labelFontSize: PropTypes.any,
  location: PropTypes.shape({
    structured: PropTypes.object,
    address: PropTypes.string,
    country: PropTypes.string,
  }),
  errors: PropTypes.object,
};

StyledInputLocation.defaultProps = {
  required: true,
  prefix: '',
};

export default StyledInputLocation;
