import React from "react";
import { BreadCrumbsWrapper } from "./style";
import { ArrowIcon } from "../../../public/assets/icons";
import { usePathname } from "next/navigation";
import { SIDEBAR_HEADINGS } from "../../../utils/constants";
import Link from "next/link";
const BreadCrumbs = () => {
  const paths = usePathname();
  const pathNames = paths?.split("/").filter((path) => path);

  const icon = SIDEBAR_HEADINGS.find((item) => {
    const itemPathNames = item.url.split("/").filter((path) => path)[0];
    return pathNames && pathNames[0] === itemPathNames;
  })?.icon;

  return (
    <BreadCrumbsWrapper>
      <ul>
        <li>
          <Link href={"/"}>{icon}</Link>
        </li>
        {pathNames?.map((link, index) => {
          let href = `/${pathNames.slice(0, index + 1).join("/")}`;
          let itemClasses = paths === href ? `breadcrum ${"active"}` : "";
          let itemLink = link[0].toUpperCase() + link.slice(1, link.length);
          const breadCrumb = itemLink.replace(/-/g, " ");
          return (
            <React.Fragment key={index}>
              <li className={itemClasses}>
                <Link href={href}>{breadCrumb}</Link>
              </li>
              {pathNames.length !== index + 1 && <ArrowIcon />}
            </React.Fragment>
          );
        })}
      </ul>
    </BreadCrumbsWrapper>
  );
};

export default BreadCrumbs;
