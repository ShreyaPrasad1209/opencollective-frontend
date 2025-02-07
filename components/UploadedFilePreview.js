import React from 'react';
import PropTypes from 'prop-types';
import { Download } from '@styled-icons/feather/Download';
import { FileText } from '@styled-icons/feather/FileText';
import { endsWith, max } from 'lodash';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components';

import { imagePreview } from '../lib/image-utils';

import PrivateInfoIcon from './icons/PrivateInfoIcon';
import Container from './Container';
import Link from './Link';
import LoadingPlaceholder from './LoadingPlaceholder';
import { fadeInDown } from './StyledKeyframes';
import StyledLink from './StyledLink';
import StyledSpinner from './StyledSpinner';
import { P } from './Text';

const ImageLink = styled(StyledLink)`
  cursor: pointer;
  overflow: hidden;
  display: block;
  width: 100%;
  height: 100%;
  text-align: center;
`;

ImageLink.defaultProps = {
  openInNewTab: true,
};

const FileTextIcon = styled(FileText)`
  opacity: 1;
`;

const DownloadIcon = styled(Download)`
  position: absolute;
  opacity: 0;
`;

const CardContainer = styled(Container)`
  position: relative;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  max-width: 100%;
  background: white;

  svg {
    transition: opacity 0.3s;
  }

  img {
    width: 100%;
    max-height: 100%;
    max-width: 100%;
    border-radius: 8px;
    @media (max-width: 40em) {
      object-fit: cover;
    }
  }
`;

const MainContainer = styled(Container)`
  text-align: center;
  ${props =>
    props.hasOnClick &&
    css`
      cursor: pointer;
      &:hover ${CardContainer} {
        ${FileTextIcon} {
          opacity: 0.25;
        }
        ${DownloadIcon} {
          opacity: 1;
          animation: ${fadeInDown} 0.3s;
        }
      }
    `}
`;

const FileName = styled(P)`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PrivateIconContainer = styled.div`
  text-align: center;
  svg {
    max-height: 32px;
  }
`;

const formatFileSize = sizeInBytes => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} bytes`;
  } else if (sizeInBytes < 1048576) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  } else if (sizeInBytes < 1073741824) {
    return `${(sizeInBytes / 1048576).toFixed(2)} MB`;
  } else {
    return `${(sizeInBytes / 1073741824).toFixed(2)} GB`;
  }
};

/**
 * To display the preview of a file uploaded on Open Collective.
 * Supports images and PDFs.
 */
const UploadedFilePreview = ({
  isPrivate,
  isLoading,
  isDownloading,
  url,
  size,
  maxHeight,
  alt,
  fileName,
  fileSize,
  showFileName,
  border,
  ...props
}) => {
  let content = null;
  const isText = endsWith(url, 'csv') || endsWith(url, 'txt') || endsWith(url, 'pdf');

  if (isLoading) {
    content = <LoadingPlaceholder borderRadius={8} />;
  } else if (isDownloading) {
    content = <StyledSpinner size="50%" />;
  } else if (isPrivate) {
    content = (
      <PrivateInfoIcon color="#dcdee0" size="60%" tooltipProps={{ childrenContainer: PrivateIconContainer }}>
        <FormattedMessage id="Attachment.Private" defaultMessage="This attachment is private" />
      </PrivateInfoIcon>
    );
  } else if (!url && props.onClick) {
    content = (
      <React.Fragment>
        <FileTextIcon color="#dcdee0" size="60%" />
        <DownloadIcon color="#b3b3b3" size="30%" />
      </React.Fragment>
    );
  } else if (!url) {
    content = <FileText color="#dcdee0" size="60%" />;
  } else if (isText) {
    content = <FileTextIcon color="#dcdee0" size="60%" />;
  } else {
    const resizeWidth = Array.isArray(size) ? max(size) : size;
    content = <img src={imagePreview(url, null, { width: resizeWidth })} alt={alt || fileName} />;
  }

  return (
    <MainContainer
      {...props}
      hasOnClick={Boolean(url || props.onClick)}
      maxWidth={size}
      as={url ? Link : 'div'}
      href={url}
      title={fileName}
      openInNewTab
    >
      <CardContainer size={size} maxHeight={maxHeight} title={fileName} border={border}>
        {content}
      </CardContainer>
      {showFileName && (
        <Container mt="4px" maxWidth={size || 100} textAlign="left" px={1}>
          {isLoading ? (
            <LoadingPlaceholder height={12} />
          ) : fileName ? (
            <FileName fontSize="13px" color="black.700" fontWeight="700">
              {fileName}
            </FileName>
          ) : (
            <P fontStyle="italic" fontSize="13px" color="black.700">
              <FormattedMessage id="File.NoFilename" defaultMessage="No filename" />
            </P>
          )}
          {fileSize && (
            <P mt="2px" fontSize="11px" lineHeight="16px" color="black.600" fontWeight="400">
              {formatFileSize(fileSize)}
            </P>
          )}
        </Container>
      )}
    </MainContainer>
  );
};

UploadedFilePreview.propTypes = {
  url: PropTypes.string,
  isPrivate: PropTypes.bool,
  isLoading: PropTypes.bool,
  isDownloading: PropTypes.bool,
  showFileName: PropTypes.bool,
  alt: PropTypes.string,
  fileName: PropTypes.string,
  onClick: PropTypes.func,
  fileSize: PropTypes.number,
  border: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
};

UploadedFilePreview.defaultProps = {
  size: 88,
  border: '1px solid #dcdee0',
  alt: 'Uploaded file preview',
};

export default UploadedFilePreview;
