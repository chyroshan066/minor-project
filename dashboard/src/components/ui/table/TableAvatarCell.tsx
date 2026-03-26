import { Img, Name } from "@/types";
import Image from "next/image";

interface TableAvatarCellProps extends Name, Img {
  subTitle?: string;
  marginRight?: number;
}

export const TableAvatarCell = ({
  img,
  name,
  subTitle,
  marginRight = 4,
}: TableAvatarCellProps) => (
  <div className="flex px-2 py-1">
    <Image
      src={img}
      width={36}
      height={36}
      className={`inline-flex items-center justify-center mr-${marginRight} text-sm text-surface transition-all duration-200 ease-soft-in-out h-9 w-9 rounded-xl`}
      alt={name}
    />
    <div className="flex flex-col justify-center">
      <h6 className="mb-0 text-sm leading-normal">{name}</h6>
      {subTitle && (
        <p className="mb-0 text-xs leading-tight text-disabled">{subTitle}</p>
      )}
    </div>
  </div>
);
