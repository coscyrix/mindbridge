import styled from "styled-components";
import { SearchIcon } from "../../public/assets/icons";

export const ClientDetailsContainer = styled.div`
.table-filter{
    margin:10px;
    }
  .content{
    .tab-and-heading-container{
      // position:sticky;
      top:60px;
      padding:20px 0px;
    z-index: 5;
    background:var(--background-color);

    @media screen and (max-width:768px){
      top:64px;
    }
    


    .heading-container {
    display: flex;
    gap:10px;
    justify-content: space-evenly;
    align-items: start;
    gap:20px;
    @media only screen and (max-width:1100px){
      flex-direction:column;
      align-items:flex-start;
      gap:10px;
    }
    .heading{
      display:flex;
      width: 100%;
      .children-wrapper{
        width: 100%;
      }

      .heading-text{
        margin:0;
      }

      .heading-desc{
        margin:0;
      }

      .heading-wrapper{
        display:flex;
        flex-direction:column;
        gap:6px;

        @media screen and (max-width:640px){
          gap:10px;
        }

        .mobile-heading-wrapper{
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;
          button{
          display: none;
          @media screen and (max-width:640px){
            display: flex;
        background: var(--primary-button-color);
        border-radius: 8px;
        color: #ffffff;

        &:hover{
          background:var(--primary-button-hover-color);
        }
          }}
        }

        @media screen and (max-width: 998px) {
            align-items:start;
          }
      }

      @media only screen and (max-width:998px){
        text-align:center;
      }
    }
    .custom-select-container {
      display:none;
      .select-container .multi-select {
        padding-bottom:0px;
        .select__control{
          width: max-content;
        padding:1px 6px;
      }}
      @media screen and (max-width : 640px){
        display:block;
        .custom-select {
          width: 100%;
          margin-bottom: 10px;
          &__selected {
            border: 1px solid #e1e1e1;
            padding: 10px 12px;
            border-radius: 8px;
            box-shadow: 0px 1px 2px 0px #a4acb933;
          }
        }
      }
    }

    .mobile-button-group{
    .create-client-button {
        margin-left: 4px;
        background: var(--primary-button-color);
        border-radius: 8px;
        color: #ffffff;

        &:hover{
          background:var(--primary-button-hover-color);
        }
      }
        display:none;
        width:100%;
        justify-content: space-between;
         @media screen and (max-width: 640px) {
            display:flex;
            .dropdowns-container{
              display:flex;
              gap:4px;
            }
          }
        .search-bar{
            input{
              width:100%;
            }
        }

        .action-button-wrapper{
          position:relative;
          .dropdown_list-container{
            @media screen and (max-width:768px){
              right:0px;
            }
          }
        }

        .more-button-wrapper{
          width:200px;
          border: 1px solid #e7e7e7;
          position:absolute;
          z-index:10;
          top:50px;
          right:0;
          border-radius:4px;
          background: white;
          font-size:13px;
          font-weight:500; 
          padding:4px;

          .button-heading:hover{
            background:#f6f6f6;
            border-radius:6px;
          }

          .action{
            padding:6px 14px;
            margin: 4px 0;
            display: flex;
            flex-direction: row-reverse;
            justify-content: flex-end;
            gap: 4px;
          }
        }

        .button-wrapper{
          width:200px;
          border: 1px solid #e7e7e7;
          position:absolute;
          z-index:10;
          top:50px;
          right:0;
          border-radius:4px;
          display:flex;
          flex-direction:column;
          gap:2px;
          background: white;
          font-size:13px;
          font-weight:500;        

        .top-action-button-heading{
          padding:4px 7px;
          border-bottom: 1px solid #e1e1e1;
        }

        .button-heading{
          padding:4px 7px;
        }
          
        .action-button-heading{
          padding: 4px 7px;
          border-bottom: 1px solid #e1e1e1;
        }
        .action{
          padding: 6px 14px;
          display:flex;
          justify-content:space-between;
        }
        }

        .hide{
          display:none;
        }
    }

    .tab{
      display:flex;

      .active{
        background:var(--active-tab-background);
        color:#fff;
      }
      button{
        background:#fff;
        color:var(--inactive-tab-color);
        border:1px solid #e1e1e1;
        padding:12px;
        min-width:85px;

        &:first-child{
          border-top-left-radius:6px;
          border-bottom-left-radius:6px;
          border-right:0px;
        }

        &:last-child{
          border-top-right-radius:6px;
          border-bottom-right-radius:6px;
        }
      }
    }

    .search-field {
      position: relative;
      width: 250px;
      display: flex;
      align-items: center;

      input {
        width: 100%;
        padding: 8px 12px 8px 36px; // Padding to make space for the search icon
        border: 1px solid #ccc;
        border-radius: 8px;
        font-size: 14px;
        color: #333;
        outline: none;

        &::placeholder {
          color: #999;
        }

        &:focus {
          border-color: #6c63ff;
          box-shadow: 0 0 3px rgba(108, 99, 255, 0.5);
        }
      }

      &::before {
        content: ${(<SearchIcon />)}
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 16px;
        color: #999;
      }
    }

    .button-group {
      display: flex;
      gap: 8px;


      .custom-select-container {
        display: flex;
        gap: 8px;
        align-items: end;
        .custom-select {
          width: max-content;
          margin-bottom: 0px;
          &__selected {
            border: 1px solid #e1e1e1;
            padding: 10px 12px;
            border-radius: 8px;
            box-shadow: 0px 1px 2px 0px #a4acb933;
          }
        }
      }

      @media screen and (max-width: 1100px) {
        width:100%;
        justify-content:space-between;
      }
      @media screen and (max-width: 640px) {
       display: none;
      }

      .function-button{
        display: flex;
        gap: 8px;
      }

      @media screen and (max-width: 576px) {
        display: none;
      }

      .create-client-button {
        margin-left: 4px;
        background: var(--primary-button-color);
        border-radius: 8px;
        color: #ffffff;

        &:hover{
          background:var(--primary-button-hover-color);
        }
      }
    }
  }
    }

  .pagination-controls{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30px;
    gap:20px;

    .page-numbers{
      button{
      background: transparent;
      border: none;
      border-radius:6px;
      width:32px;
      height:32px;
        }

      .active{
      background: #FFFFFF;
      border: 1px solid #E1E1E1;
      box-shadow: 0px 1px 2px 0px #A4ACB933;
    }
    }
    
    .prev-button{
      svg{
        transform:rotate(180deg);
      }
    }
  }

}
`;
