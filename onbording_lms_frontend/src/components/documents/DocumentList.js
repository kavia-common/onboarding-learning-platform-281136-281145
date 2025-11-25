import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getDocumentsStatus } from '../../utils/documentsStatus';
import styles from './DocumentList.module.css';

/**
 * PUBLIC_INTERFACE
 * DocumentList
 * Shows a list of documents with status and a button to view details.
 */
export default function DocumentList({ items, onOpen }) {

  // map document keys to dedicated routes for deep viewing
  const routeFor = (key) => {
    switch (key) {
      case 'code_of_conduct':
        return '/code-of-conduct';
      case 'nda':
        return '/nda';
      case 'internship_letter':
        return '/offer-letter';
      default:
        return null;
    }
  };

  const statuses = useMemo(() => getDocumentsStatus(), []);

  return (
    <div className={styles.container} aria-label="Documents list" role="list">
      <div className={styles.header} role="presentation" aria-hidden="true">
        <h2 className={styles.title}>Documents</h2>
      </div>

      <div className={styles.list}>
        {items.map((doc) => {
          // Map items keys (code_of_conduct, nda, internship_letter) to store keys
          const storeKey =
            doc.key === 'code_of_conduct'
              ? 'codeOfConduct'
              : doc.key === 'nda'
              ? 'nda'
              : doc.key === 'internship_letter'
              ? 'offerLetter'
              : null;

          const status = storeKey && statuses[storeKey] ? statuses[storeKey] : 'Pending';
          const isDone = status === 'Completed';
          const deepLink = routeFor(doc.key);

          // Accessible label for the action
          const aria = `View ${doc.name}`;

          return (
            <div className={styles.item} role="listitem" key={doc.key}>
              <div className={styles.left}>
                <div className={styles.name}>
                  <span>{doc.name}</span>
                  <span aria-label="required" title="required" className={styles.required}>
                    *
                  </span>
                </div>

                <div className={styles.meta}>
                  <span
                    className={`${styles.dot} ${isDone ? styles.dotCompleted : styles.dotPending}`}
                    aria-hidden="true"
                  />
                  <span className={isDone ? styles.badgeCompleted : styles.badgePending + ' ' + styles.badge} role="status" aria-live="polite">
                    {isDone ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                {deepLink ? (
                  <Link to={deepLink} className={styles.button} aria-label={aria}>
                    View
                  </Link>
                ) : (
                  <button onClick={() => onOpen?.(doc.key)} className={styles.button} aria-label={aria}>
                    View
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
