import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

function Eye(props: any) {
  return (
    <Svg
      width={18}
      height={11}
      viewBox="0 0 18 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path
        d="M.052 1.907a1 1 0 111.914-.577c2.086 6.986 11.982 6.987 14.07.004a1.001 1.001 0 011.918.57 9.498 9.498 0 01-1.813 3.417l1.275 1.276a1 1 0 01-1.414 1.414l-1.311-1.31a9.1 9.1 0 01-2.32 1.268l.357 1.335a1 1 0 11-1.931.518l-.364-1.357c-.947.14-1.915.14-2.862 0l-.364 1.357a1 1 0 11-1.931-.518l.357-1.335a9.1 9.1 0 01-2.32-1.27l-1.31 1.312A1 1 0 11.587 6.597l1.275-1.275C1.078 4.386.452 3.248.05 1.908h.002z"
        fill="#E4CCFF"
      />
    </Svg>
  );
}

export default Eye;
