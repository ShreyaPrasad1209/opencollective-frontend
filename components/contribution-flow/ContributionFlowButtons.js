import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Currency from '../Currency';
import { Box, Flex } from '../Grid';
import PayWithPaypalButton from '../PayWithPaypalButton';
import StyledButton from '../StyledButton';

import { STEPS } from './constants';
import { getTotalAmount } from './utils';

class ContributionFlowButtons extends React.Component {
  static propTypes = {
    goNext: PropTypes.func,
    goBack: PropTypes.func,
    prevStep: PropTypes.shape({ name: PropTypes.string }),
    nextStep: PropTypes.shape({ name: PropTypes.string }),
    isValidating: PropTypes.bool,
    /** If provided, the PayPal button will be displayed in place of the regular submit */
    paypalButtonProps: PropTypes.object,
    currency: PropTypes.string,
    isCrypto: PropTypes.bool,
    tier: PropTypes.shape({ type: PropTypes.string }),
    stepDetails: PropTypes.object,
    stepSummary: PropTypes.object,
  };

  state = { isLoadingNext: false };

  goNext = async e => {
    e.preventDefault();
    if (this.props.goNext) {
      this.setState({ isLoadingNext: true }, async () => {
        await this.props.goNext();
        this.setState({ isLoadingNext: false });
      });
    }
  };

  getStepLabel(step) {
    switch (step.name) {
      case STEPS.PROFILE:
        return <FormattedMessage id="ContributionFlow.YourInfo" defaultMessage="Your info" />;
      case STEPS.PAYMENT:
        return <FormattedMessage id="ContributionFlow.Payment" defaultMessage="Payment" />;
      case STEPS.DETAILS:
        return <FormattedMessage id="ContributionFlow.Contribution" defaultMessage="Contribution" />;
    }
  }

  render() {
    const { goBack, isValidating, nextStep, paypalButtonProps, currency, tier, isCrypto, stepDetails } = this.props;
    const totalAmount = getTotalAmount(stepDetails, this.props.stepSummary, isCrypto);
    return (
      <Flex flexWrap="wrap" justifyContent="center">
        <Fragment>
          {goBack && (
            <StyledButton
              mx={[1, null, 2]}
              minWidth={!nextStep ? 185 : 145}
              onClick={goBack}
              color="black.600"
              disabled={isValidating}
              data-cy="cf-prev-step"
              type="button"
              mt={2}
            >
              &larr;{' '}
              {this.getStepLabel(this.props.prevStep) || (
                <FormattedMessage id="Pagination.Prev" defaultMessage="Previous" />
              )}
            </StyledButton>
          )}
          {!paypalButtonProps || nextStep ? (
            <StyledButton
              mt={2}
              mx={[1, null, 2]}
              minWidth={!nextStep ? 185 : 145}
              buttonStyle="primary"
              onClick={this.goNext}
              disabled={isCrypto && totalAmount <= 0}
              loading={isValidating || this.state.isLoadingNext}
              data-cy="cf-next-step"
              type="submit"
            >
              {nextStep ? (
                <React.Fragment>
                  {this.getStepLabel(nextStep) || (
                    <FormattedMessage id="contribute.nextStep" defaultMessage="Next step" />
                  )}{' '}
                  &rarr;
                </React.Fragment>
              ) : isCrypto ? (
                <FormattedMessage
                  defaultMessage="I've sent {CryptoAmount} {CryptoCurrency} to this wallet address"
                  values={{ CryptoAmount: totalAmount, CryptoCurrency: currency }}
                />
              ) : tier?.type === 'TICKET' ? (
                <FormattedMessage
                  id="contribute.ticket"
                  defaultMessage="Get {quantity, select, 1 {ticket} other {tickets}}"
                  values={{ quantity: stepDetails.quantity || 1 }}
                />
              ) : totalAmount ? (
                <FormattedMessage
                  id="contribute.amount"
                  defaultMessage="Contribute {amount}"
                  values={{
                    amount: <Currency value={totalAmount} currency={currency} precision="auto" />,
                  }}
                />
              ) : (
                <FormattedMessage id="contribute.submit" defaultMessage="Make contribution" />
              )}
            </StyledButton>
          ) : (
            <Box mx={[1, null, 2]} minWidth={200} mt={2}>
              <PayWithPaypalButton {...paypalButtonProps} isSubmitting={isValidating || this.state.isLoadingNext} />
            </Box>
          )}
        </Fragment>
      </Flex>
    );
  }
}

export default ContributionFlowButtons;
